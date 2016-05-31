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

var path = require("path");
var chai = require("chai");
var should = chai.should();

chai.use(require('chai-things'));

var options = {
  foo: "foo"
};

exports.options = options;
exports.should = should;
exports.chai = chai;
exports.expect = chai.expect;
exports.assert = chai.assert;
exports.path = path;