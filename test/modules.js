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

var common = require("./common");
var options = common.options;
var assert = common.assert;
var expect = common.expect;
var should = common.should;
var path = common.path;

var Modules = require("../lib/modules");
var modules;

var numInternalModules = 6;

var module = {
  name : 'test',
  initialize : function() {
  }
};

beforeEach(function () {
  modules = new Modules();
});

describe('init', function() {
  it('should automatically scan the internal modules', function() {
    Object.keys(modules.modules).length.should.equal(numInternalModules);
  });
});

describe('registration', function() {
  it('should register libraries', function() {
    var library = {
      modules : [ module ]
    }
    modules.registerLibrary(library);
    modules.modules['test'].should.equal(module);
  });

  it('should register modules', function() {
    modules.registerModule(module);
    modules.modules['test'].should.equal(module);
  });

  it('should register directories of modules', function() {
    modules.registerModuleDirectory(path.resolve(__dirname, 'helpers/modules'));
    Object.keys(modules.modules).length.should.equal(numInternalModules + 2);
  });

  it('should retrieve a module by name including its dependencies', function() {
    modules.registerModuleDirectory(path.resolve(__dirname, 'helpers/modules'));
    var resolved = modules.get('B');
    resolved[0].name.should.equal('A');
    resolved[1].name.should.equal('B');
  });

  it('should throw an error when a module is not found', function() {
    expect(function() {
      var resolved = modules.get('unknown');
    }).to.throw("Could not find module unknown");
  });
});