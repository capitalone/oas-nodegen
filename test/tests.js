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

function importTest(name, path) {
  describe(name, function () {
    require(path);
  });
}

var common = require("./common");

describe('Core', function() {
  importTest("Writer", './writer');
  importTest("Generator", './generator');
  importTest("Loader", './loader');
  importTest("Modules", './modules');
  importTest("Templates", './templates');
  importTest("Utilities", './utilities');
});

describe('Template Engines', function() {
  importTest("handlebars", './template-engines/handlebars');
  importTest("hogan", './template-engines/hogan');
  importTest("pug", './template-engines/pug');
  importTest("underscore", './template-engines/underscore');
});

describe('Modules', function() {
  importTest("Helpers", './modules/helpers');
  importTest("Java", './modules/java');
  importTest("Java8", './modules/java-8');
  importTest("JavaBeanValidation", './modules/java-bean-validation');
  importTest("JaxB", './modules/jax-b');
  importTest("JaxRS", './modules/jax-rs');
});