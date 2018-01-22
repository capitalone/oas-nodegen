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

/**
 * Returns the response for either 200 or 201 response codes.
 *
 * @function
 * @param {object} operation The operation object
 * @returns the response for 200 or 201 if found, null otherwise
 */
module.exports.getSuccessResponse = function(operation) {
  return operation.responses && (operation.responses["200"] || operation.responses["201"])
      ? (operation.responses["200"] || operation.responses["201"]) : null;
}

/**
 * Translates a value into a lookup table.
 *
 * @function
 * @param {object} obj The current reference object to resolve
 * @param {object} spec The current specification object
 * @param {object} references The references lookup object
 * @returns the translated value if found, otherwise the defaultValue if specified, or input value.
 */
module.exports.translate = function(value, lookup, defaultValue) {
  return lookup[value] || defaultValue  || value;
}

/**
 * Resolves references to other objects in the spec or external specs.
 *
 * @function
 * @param {object} obj The current reference object to resolve
 * @param {object} spec The current specification object
 * @param {object} references The references lookup object
 * @returns the object that contains the referenced object and spec.
 */
module.exports.resolveReference = function(obj, spec, references) {
  // No $ref, just return with the passed in object
  //
  if (!obj.$ref) {
    return { obj: obj, spec: spec, same: true };
  }

  // Parse external reference and path
  //
  var ref = obj.$ref;
  var index = ref.indexOf('#');
  var root = spec;
  var path = null;
  var ext = null;

  if (index != -1) {
    ext = ref.substring(0, index);
    path = ref.substring(index + 1);
  } else {
    ext = ref;
  }

  // Lookup the external reference
  //
  if (ext != null && ext.length > 0) {
    root = references.sub[ext] || references.top[ext];

    if (root == null) {
      throw new Error("Could not find reference for " + ext);
    }
  }

  // Eliminate leading slashes, then split
  //
  if (path && path.length > 0) {
    while (path.startsWith('/')) path = path.substring(1);
    path = path.split('/');
  } else {
    path = null;
  }

  var data = root;
  var parent = null;

  if (path) {
    _.each(path, function(slug, index) {
      if (data != null) {
        parent = data;
        if (data[slug] === undefined) {
          var iteree = path.slice(0, index+1).join('/')
          throw new Error("Could not find " + iteree + " in " + ext);
        }
        data = data[slug];
      }
    });
  }

  return { obj: data, spec: root, same: false };
}

/**
 * Returns the last section of a JSON reference path.
 *
 * @function
 * @param {object} $ref The reference path value
 * @returns the referenced object's name
 */
module.exports.getReferenceName = function($ref) {
  while ($ref.startsWith('#')) $ref = $ref.substring(1);
  var slash = $ref.lastIndexOf('/');
  return $ref.substring(slash + 1);
}

/**
 * Extracts the model name from a JSON reference path.
 *
 * @function
 * @param {object} $ref The reference path value
 * @returns the referenced object's model name
 */
module.exports.extractModelName = function($ref) {
  $ref = module.exports.getReferenceName($ref);
  var dot = $ref.lastIndexOf('.');
  if (dot != -1) {
    $ref = $ref.substring(0, dot);
  }

  return $ref;
}

/**
 * Retreives the first mime type of a consumes or produces array.
 *
 * @function
 * @param {string[]} array The consumes or produces array
 * @returns mime type if the array is populated, a default mime type otherwise
 */
module.exports.getMimeType = function(array) {
  if (!array || array.length == 0) {
    return 'application/json';
  }

  if (_.includes(array, 'application/json')) {
    return 'application/json';
  }

  return array[0];
}

/**
 * Recreates an object with the keys sorted by their name (case insensitive).
 *
 * @function
 * @param {object} object The object to sort
 * @returns a new object with sorted keys
 */
module.exports.sortKeys = function(object) {
  // Sort the resources for name
  //
  var keys = _.sortBy(_.keys(object), function(item) { return item.toLowerCase(); });
  var sorted = {};

  _.each(keys, function(key) {
    sorted[key] = object[key];
  });

  return sorted;
}

/**
 * Capitalizes a string
 *
 * @function
 * @param {string} string The string to capitalize
 * @returns the capitalized string value
 */
module.exports.capitalize = function(string) {
  if (string != null && string.length > 0) {
    return string.substring(0,1).toUpperCase() + string.substring(1);
  }

  return string;
}

/**
 * Uncapitalizes a string
 *
 * @function
 * @param {string} string The string to uncapitalize
 * @returns the uncapitalized string value
 */
module.exports.uncapitalize = function(string) {
  if (string != null && string.length > 0) {
    return string.substring(0,1).toLowerCase() + string.substring(1);
  }

  return string;
}

/**
 * Generates a random number within a given range
 *
 * @function
 * @param {number} low The minimum value
 * @param {number} high The maximum value
 * @returns the randomly generated number
 */
module.exports.random = function (low, high) {
  return Math.floor(Math.random() * (high - low + 1) + low);
}