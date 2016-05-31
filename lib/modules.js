/*
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
 * Represents a ModuleRegistry
 * @constructor
 */
function ModuleRegistry() {
  ModuleRegistry.init.apply(this, arguments);
}
module.exports = ModuleRegistry;

ModuleRegistry.init = function() {
  this.modules = {};
  this.registerModuleDirectory(__dirname, 'modules');
}

/**
 * Registers a library's modules
 *
 * @param {object} library The library to register
 * @returns same instance to allow chaining
 */
ModuleRegistry.prototype.registerLibrary = function(library) {
  _.each(library.modules, _.bind(function(module) {
    this.registerModule(module);
  }, this));

  return this; // Allow chaining
}

/**
 * Registers a directory of modules
 *
 * @param {string|string[]} path The path to scan
 * @returns same instance to allow chaining
 */
ModuleRegistry.prototype.registerModuleDirectory = function() {
  var directory = path.resolve.apply(null, arguments);
  // console.log("Scanning directory for modules: " + directory);

  fs.readdirSync(directory).forEach(_.bind(function(file) {
    if (path.extname(file) == '.js') {
      this.registerModule(path.resolve(directory, file));
    }
  }, this));

  return this; // Allow chaining
}

/**
 * Registers a single module
 *
 * @param {string|object} pathOrModule The path or module object
 * @returns same instance to allow chaining
 */
ModuleRegistry.prototype.registerModule = function(path) {
  var module = _.isString(path) ? require(path) : path;
  this.modules[module.name] = module;

  // console.log("Registered module: " + module.name);

  return this; // Allow chaining
}

/**
 * Returns modules (along with dependencies) to register
 *
 * @param {string|string[]} names Names of the modules to return
 * @returns {object[]} The list of resolved modules
 */
ModuleRegistry.prototype.get = function() {
  var args = _.flatten(arguments);
  var dependencies = [];

  for (var i = 0; i < args.length; i++) {
    this._resolveDependencies(args[i], dependencies);
  }

  return dependencies;
}

/**
 * Recursive method to resolve module dependencies
 *
 * @ignore
 * @private
 * @param {string} name The name of the nodule to return
 * @param {object[]} dependencies The list of modules to build
 */
ModuleRegistry.prototype._resolveDependencies = function(name, dependencies) {
  var module = this.modules[name];

  if (module == null) {
    throw new Error("Could not find module " + name);
  }

  _.each(module.dependsOn, _.bind(function(dependency) {
    this._resolveDependencies(dependency, dependencies);
  }, this));

  if (_.find(dependencies, function(added) {
    return added.name == module.name;
  }) == null) {
    dependencies.push(module);  
  }
}