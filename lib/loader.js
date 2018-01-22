/*
 * SPDX-Copyright: Copyright (c) Capital One Services, LLC
 * SPDX-License-Identifier: Apache-2.0
 * Copyright 2016 Capital One Services, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License. 
 */

var _ = require('lodash');
var Q = require('q');
var request = require('request');
var fs = require('fs');
var path = require('path');
var url = require('url');
var jsyaml = require('js-yaml');
var util = require('./utilities');

/**
 * Represents a Loader
 * @constructor
 */
function Loader() {
  Loader.init.apply(this, arguments);
}
module.exports = Loader;

// Valid YAML mime types
var yamlMimes = ['text/yaml', 'text/x-yaml', 'application/yaml', 'application/x-yaml'];

// Valid YAML extensions
var yamlExtensions = ['.yaml', '.yml'];

/**
 * Utility class for incrementing and decrementing a counter and
 * resolving data when the counter reaches zero.
 *
 * @private
 */
function AsyncCounter(locations) {
  this.count = 0;
  this.deferred = Q.defer();
  this.locations = locations;
  this.data = [];
}

AsyncCounter.prototype.increment = function() {
  this.count++;
}

AsyncCounter.prototype.decrement = function() {
  if (--this.count == 0) {
    if (this.data.length == 1) {
      this.deferred.resolve(this.data[0]);  
    } else {
      this.deferred.resolve(this.data);
    }
  }
}

AsyncCounter.prototype.reject = function(error) {
  this.deferred.reject(error);
}

function isURL(location) {
  return location.startsWith('http:') || location.startsWith('https:');
}

function resolvePath(location, rel) {
  var index = Math.max(location.lastIndexOf('/'), location.lastIndexOf('\\'));
  if (index != -1) {
    location = location.substring(0, index + 1);
  }

  if (isURL(location)) {
    return url.resolve(location, rel);
  } else {
    return path.resolve(location, rel);
  }
}

Loader.init = function() {
  this.loadedSpecs = {};
  this.doSanitize = true;
  this.poisonDetected = false;
  this.allowPosion = false;
}

/**
 * Loads an OAS/Swagger specification from either a path or URI.
 *
 * @param {string} location The path or URI for the specification
 * @returns a promise for the loaded specification
 */
Loader.prototype.load = function() {
  var locations = _.flatten(arguments);
  var asyncCounter = new AsyncCounter(locations);
  var $references = {
    top: {},
    sub: {}
  };
  _.each(locations, function(location) {
    this._load(location, asyncCounter, $references, true);
  }.bind(this));

  return asyncCounter.deferred.promise;
}

Loader.prototype._load = function(location, asyncCounter, $references) {
  if (this.loadedSpecs[location] != null) {
    return;
  }

  asyncCounter.increment();

  var deferred = Q.defer();

  this.loadedSpecs[location] = {}; // placeholder

  console.log('Loading ' + location);

  // Loading for URLs
  //
  if (isURL(location)) {
    request(location, function (error, response, body) {
      if (!error && response && response.statusCode == 200) {
        var contentType = response.headers['content-type'];

        if (contentType) {
          contentType = contentType.split(';')[0];
        }

        var ext = path.extname(location);

        if (ext) {
          ext = ext.toLowerCase();
        }

        try {
          // Parse as JSON or YAML based on the mime type
          //
          var data = _.includes(yamlMimes, contentType) || _.includes(yamlExtensions, ext)
            ? jsyaml.load(body)
            : JSON.parse(body);

          deferred.resolve(data);
        } catch (err) {
          deferred.reject(err);
        }
      } else if (response) {
        deferred.reject(new Error("Received status code " + response.statusCode));
      } else {
        deferred.reject(error);
      }
    });
  // Otherwise, load it as a file location
  //
  } else {
    fs.readFile(location, 'utf8', function(error, body) {
      if (!error) {
        var ext = path.extname(location);

        if (ext) {
          ext = ext.toLowerCase();
        }

        try {
          var data = _.includes(yamlExtensions, ext)
            ? jsyaml.load(body)
            : JSON.parse(body);

          deferred.resolve(data);
        } catch (err) {
          deferred.reject(err);
        }
      } else {
        deferred.reject(error);
      }
    });
  }

  deferred.promise.then(_.bind(function(data) {
    this.loadedSpecs[location] = data;

    if (_.includes(asyncCounter.locations, location)) {
      // Verify the OAS/Swagger version
      //
      var version = parseInt(data.openapi || data.swagger);

      if (isNaN(version) || version < 2) {
        asyncCounter.reject(new Error("Was not a valid OAS or swagger document (version 2.0 or greater is supported)"));
        return;
      }

      data.$references = $references;
      asyncCounter.data.push(data);
      $references.top[location] = data;
    } else {
      $references.sub[location] = data;
    }

    try {
      this._scanReferences(data, data, location, asyncCounter, $references);
    } catch (err) {
      asyncCounter.reject(err);
    }

    asyncCounter.decrement();
  }, this)).fail(function(err) {
    asyncCounter.reject(err);
  });
}

Loader.prototype._scanReferences = function(object, root, location, asyncCounter, $references) {
  _.each(object, _.bind(function(value, key) {
    if (_.isString(key) && this.doSanitize) {
      this.sanitize(key, location, asyncCounter);
    }
    if (_.isString(value) && this.doSanitize) {
      object[key] = this.sanitize(value, location, asyncCounter);
    }
    // Look for $ref keys and process the value if possibly external
    //
    if (key == "$ref" && _.isString(value) && !value.startsWith('#')) {
      var index = value.indexOf('#');

      if (index != -1) {
        var external = value.substring(0, index);
        var path = value.substring(index);
        external = resolvePath(location, external);

        // Make absolute path for external location
        //
        object.$ref = external + path;
        this._load(external, asyncCounter, $references);
      } else {
        var external = resolvePath(location, value);
        object.$ref = external;
        this._load(external, asyncCounter, $references);
      }
    // Omit processing our internal $references object
    //
    } else if (key != '$references' && _.isObject(value)) {
      this._scanReferences(value, root, location, asyncCounter, $references);
    }
  }, this));
}

Loader.prototype.sanitize = function(value, location, asyncCounter) {
  var orig = value;
  value = value
    .replace(/\*\//g, '')
    .replace(/\/\*/g, '')
    .replace(/\Weval[\s]*\(/gi, '')
    .replace(/\Wexec[\s]*\(/gi, '')
    .replace(/\Wfunction[\s]*\(/gi, '')
    .replace(/\Wsystem[\s]*\(/gi, '')
    .replace(/<script>/gi, '')
    .replace(/\Wtry[\s]*{/gi, '')
    .replace(/\);/g, '')
    .replace(/=end/gi, '');
  if (value != orig) {
    if (!this.poisonDetected) {
      console.log('WARNING: Detected a potentially poisoned specification in ' +
        location + '.  Please check the specification for code injection attacks.');
      this.poisonDetected = true;
    }

    console.log('Suspected injection:', orig);

    if (!this.allowPosion) {
      asyncCounter.reject(new Error('Suspected code injection:' + orig));
    }
  }
  return value;
}