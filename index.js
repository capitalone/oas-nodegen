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

'use strict';

module.exports.Loader = require('./lib/loader');
module.exports.Modules = require('./lib/modules');
module.exports.Templates = require('./lib/templates');
module.exports.Generator = require('./lib/generator');
module.exports.Writer = require('./lib/writer');
module.exports.Utilities = require('./lib/utilities');
module.exports.utils = module.exports.Utilities;

function applyToConstructor(constructor, args) {
  var factoryFunction = constructor.bind.apply(constructor, args);
  return new factoryFunction();
}

module.exports.createLoader = function() {
  return applyToConstructor(module.exports.Loader, Array.from(arguments));
}

module.exports.createModules = function() {
  return applyToConstructor(module.exports.Modules, Array.from(arguments));
}

module.exports.createTemplates = function() {
  return applyToConstructor(module.exports.Templates, Array.from(arguments));
}

module.exports.createGenerator = function() {
  return applyToConstructor(module.exports.Generator, Array.from(arguments));
}

module.exports.createWriter = function() {
  return applyToConstructor(module.exports.Writer, Array.from(arguments));
}
