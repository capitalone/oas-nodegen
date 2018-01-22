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

var fs = require('fs');
var path = require('path');
var _ = require('lodash');

/**
 * Represents a Templates
 * @constructor
 * @param {object} config The configuration object (optional)
 */
function Templates() {
  Templates.init.apply(this, arguments);
}
module.exports = Templates;

Templates.init = function(defaultOptions) {
  this.templateEnginesByName = {};
  this.templateEnginesByExt = {};
  this.templateDirectories = [];

  this.setDefaultOptions(defaultOptions);

  this.registerEngineDirectory(__dirname, 'template-engines');
  this.registerTemplateDirectory(__dirname, '../templates');
}

/**
 * Sets the default options passed to the compile function of each template engine.
 *
 * @param {object} defaultOptions The default options
 * @returns same instance to allow chaining
 */
Templates.prototype.setDefaultOptions = function(defaultOptions) {
  this.defaultOptions = defaultOptions || {};

  return this; // Allow chaining
}

/**
 * Registers a single library containing its own template engine
 * directories, template engines, and template directories.
 *
 * @param {object} library The library object
 * @returns same instance to allow chaining
 */
Templates.prototype.registerLibrary = function(library) {
  _.each(library.templateEngineDirs, _.bind(function(dir) {
    this.registerEngineDirectory(dir);
  }, this));

  _.each(library.templateEngines, _.bind(function(engine) {
    this.registerEngine(engine);
  }, this));

  _.each(library.templateDirs, _.bind(function(dir) {
    this.registerTemplateDirectory(dir);
  }, this));

  return this; // Allow chaining
}

/**
 * Registers an engine directory.
 *
 * @param {string[]} path The engine directory path
 * @returns same instance to allow chaining
 */
Templates.prototype.registerEngineDirectory = function() {
  var directory = path.resolve.apply(null, arguments);
  // console.log("Scanning directory for template engines: " + directory);

  fs.readdirSync(directory).forEach(_.bind(function(file) {
    if (path.extname(file) == '.js') {
      this.registerEngine(path.resolve(directory, file));
    }
  }, this));

  return this; // Allow chaining
}

/**
 * Registers a single engine.
 *
 * @param {string[]|object} path The engine path or object
 * @returns same instance to allow chaining
 */
Templates.prototype.registerEngine = function(path) {
  var engine = _.isObject(path) ? path : require(path);
  this.templateEnginesByName[engine.name] = engine.compile;

  _.each(engine.extensions, _.bind(function(extension) {
    this.templateEnginesByExt[extension] = engine.compile;
  }, this));

  // console.log("Registered template engine: " + engine.name);

  return this; // Allow chaining
}

/**
 * Registers a template directory.
 *
 * @param {string[]} path The template directory path
 * @returns same instance to allow chaining
 */
Templates.prototype.registerTemplateDirectory = function() {
  var directory = path.resolve.apply(null, arguments);
  this.templateDirectories.push(directory);
  // console.log("Registered template directory: " + directory);

  return this; // Allow chaining
}

/**
 * Compiles a template from source
 *
 * @param {string} engineName The engine name to lookup
 * @param {string} source The template source
 * @param {object} options (Optional) The template options
 * @returns the compile template function
 */
Templates.prototype.compileFromSource = function(engineName, source, options) {
  var engine = this.templateEnginesByName[engineName];

  if (engine == null) {
    throw new Error("Could not find template engine for " + engineName);
  }

  return engine(source, options || this.defaultOptions);
}

/**
 * Compiles a template from a file
 *
 * @param {string} templateFile The template file to compile
 * @param {object} options (Optional) The template options
 * @returns the compile template function
 */
Templates.prototype.compileFromFile = function(templateFile, options) {
  var extension = path.extname(templateFile);

  var engine = this.templateEnginesByExt[extension];

  if (engine == null) {
    throw new Error("Could not find template engine for file extension " + extension);
  }

  var source = null;

  // Search for the file in each template directory
  //
  for (var i=this.templateDirectories.length - 1; i >= 0; i--) {
    try {
      var templateDirectory = this.templateDirectories[i];
      var templatePath = path.resolve(templateDirectory, templateFile);

      // Is it found and is it a file?
      //
      if (fs.statSync(templatePath).isFile()) {
        source = fs.readFileSync(templatePath, "utf8");
        break;
      }
    } catch (err) {
      // likely ENOENT, no such file or directory
    }
  }

  if (source == null) {
    throw new Error("Could not find template " + templateFile);
  }

  return engine(source, options || this.defaultOptions);
}