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

var common = require("../common");
var options = common.options;
var assert = common.assert;
var expect = common.expect;
var should = common.should;
var path = common.path;

var underscore = require("../../lib/template-engines/underscore");

describe('engine', function() {
  it('should be named correctly', function() {
    underscore.name.should.equal('underscore');
  });

  it('should handle .tmpl and .template files', function() {
    underscore.extensions.indexOf('.tmpl').should.not.equal(-1);
    underscore.extensions.indexOf('.template').should.not.equal(-1);
  });

  it('should compile templates', function() {
    var template = underscore.compile("Hello, <%= name %>!");
    template({ name : 'World' }).should.equal("Hello, World!");
  });
});