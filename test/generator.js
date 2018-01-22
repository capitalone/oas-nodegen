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
var fs = require('fs');
var jsyaml = require('js-yaml');

var Generator = require("../lib/generator");
var generator;
var counts;
var numPhases = 3;

var config = {
  setting : 'test'
}

var mockModules = {
  get : function(name) {
    return {
      name : name,
      initialize : function() {
      }
    }
  }
};

var spec = jsyaml.load(fs.readFileSync(path.resolve(__dirname, 'examples/yaml/petstore-with-actions.yaml'), 'utf8'));
spec.$references = {
  top: {
    "test" : { swagger : '2.0' }  
  },
  sub: {}
};

function initPhaseCounter(scope) {
  var contextHandler = function(context) {
    counts[scope] = (counts[scope] || 0) + 1;
  };
  generator.onPrepare(scope, contextHandler);
  generator.onDecorate(scope, contextHandler);
  generator.onFinalize(scope, contextHandler);
}

function initWriteCounter(scope) {
  var contextHandler = function() {
    counts[scope] = (counts[scope] || 0) + 1;
  };
  generator.onWrite(scope, contextHandler);
}

beforeEach(function () {
  generator = new Generator(config);
  counts = {};
});

describe('init', function() {
  it('should accept custom configuration that is accessible from callbacks', function() {
    var invoked = false;
    generator.config.setting.should.equal('test');
    generator.on('test', 'test', function(data) {
      this.config.setting.should.equal('test');
      invoked = true;
    });
    generator.emit('test', 'test', { phase : 'test' });
    invoked.should.equal(true);
  });

  it('should have default prepare, decorate & finalize phases', function() {
    generator.phases[0].should.equal('prepare');
    generator.phases[1].should.equal('decorate');
    generator.phases[2].should.equal('finalize');
  });
});

describe('modules', function() {
  it('should register pre-loaded modules', function() {
    generator.use(mockModules.get('test'));
    generator.registeredModules[0].should.equal('test');
  });

  it('should use module loader for loading modules by name', function() {
    generator.setModules(mockModules);
    generator.use('test');
    generator.registeredModules[0].should.equal('test');
  });

  it('should initialize an internal Modules instance if one is not set explicitly', function() {
    generator.use('Java');
    generator.registeredModules[1].should.equal('Java');
  });

  it('should not reload already loaded modules', function() {
    var a = require(path.resolve(__dirname, 'helpers/modules/module-a'));
    generator.use(a);
    var count = generator.registeredModules.length;
    generator.use(a);
    generator.registeredModules.length.should.equal(count);
  });

  it('should throw an error if a dependency is not already loaded', function() {
    var a = require(path.resolve(__dirname, 'helpers/modules/module-a'));
    var b = require(path.resolve(__dirname, 'helpers/modules/module-b'));

    expect(function() {
      generator.use(b);
    }).to.throw("B depends on A which is not loaded.");

    generator.use(a);
    generator.registeredModules[0].should.equal('A');
    generator.use(b);
    generator.registeredModules[1].should.equal('B');
  });
});

describe('events', function() {
  it('should register onDecorate & onFinalize callbacks', function() {
    var invoked = false;
    generator.onDecorate('test', function(data) {
      data.phase.should.equal('decorate');
      invoked = true;
    });
    generator.emit('decorate', 'test', { phase : 'decorate' });
    invoked.should.equal(true);

    invoked = false;
    generator.onFinalize('test', function(data) {
      data.phase.should.equal('finalize');
      invoked = true;
    });
    generator.emit('finalize', 'test', { phase : 'finalize' });
    invoked.should.equal(true);
  });

  it('should register onWrite callbacks', function() {
    var invoked = false;
    generator.onWrite('test', function(data) {
      data.should.equal('test');
      invoked = true;
    });
    generator.write('test', 'test');
    invoked.should.equal(true);
  });

  it('should emit a phase event for each Context, Specification', function() {
    initPhaseCounter('Context');
    initPhaseCounter('Specification');
    generator.process(spec);
    counts['Context'].should.equal(1 * numPhases);
    counts['Specification'].should.equal(1 * numPhases);
  });

  it('should emit a phase event for each PathItem, Operation, Parameter, Response', function() {
    initPhaseCounter('PathItem');
    initPhaseCounter('Operation');
    initPhaseCounter('Parameter');
    initPhaseCounter('Response');
    generator.process(spec);
    counts['PathItem'].should.equal(4 * numPhases);
    counts['Operation'].should.equal(6 * numPhases);
    counts['Parameter'].should.equal(7 * numPhases);
    counts['Response'].should.equal(12 * numPhases);
  });

  it('should filter out ignored parameters', function() {
    initPhaseCounter('Parameter');
    generator.process(spec);
    counts['Parameter'].should.equal(7 * numPhases);
    generator.addIgnoredParameters('tags');
    counts['Parameter'] = 0;
    generator.process(spec);
    counts['Parameter'].should.equal(6 * numPhases);
  });

  it('should emit a phase event for each Model, Property', function() {
    initPhaseCounter('Model');
    initPhaseCounter('Property');
    generator.process(spec);
    counts['Model'].should.equal(4 * numPhases);
    counts['Property'].should.equal(8 * numPhases);
  });

  it('should emit a phase event for each Resource, Group', function() {
    initPhaseCounter('Resource');
    initPhaseCounter('Group');
    generator.process(spec);
    counts['Resource'].should.equal(1 * numPhases);
    counts['Group'].should.equal(3 * numPhases);
  });

  it('should emit a write event for each Context, Specification, Model, Resource', function() {
    initWriteCounter('Context');
    initWriteCounter('Specification');
    initWriteCounter('Model');
    initWriteCounter('Resource');
    generator.process(spec);
    counts['Context'].should.equal(1);
    counts['Specification'].should.equal(3);
    counts['Model'].should.equal(4);
    counts['Resource'].should.equal(1);
  });

  it('should create group names based on it the path represents a collection, entity, or action', function() {
    var groupNames = [];
    generator.onFinalize('Group', function(context) {
      var group = context.group;
      groupNames.push(group.name);
    });
    generator.process(spec);
    groupNames.indexOf('Pets Collection').should.not.equal(-1);
    groupNames.indexOf('Pet').should.not.equal(-1);
    groupNames.indexOf('Pet Actions').should.not.equal(-1);
  });

  it('should sort operations by length', function() {
    var invoked = false;
    generator.onFinalize('Resource', function(context) {
      var resource = context.resource;
      resource.operations[0].path.should.equal('/pets');
      resource.operations[1].path.should.equal('/pets');
      resource.operations[2].path.should.equal('/pets/{id}');
      resource.operations[3].path.should.equal('/pets/{id}');
      resource.operations[4].path.should.equal('/pets/{id}/walk');
      resource.operations[5].path.should.equal('/pets/{id}/giveBath');
      invoked = true;
    });
    generator.process(spec);
    invoked.should.equal(true);
  });
});