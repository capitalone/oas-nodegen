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

var common = require("../common");
var options = common.options;
var assert = common.assert;
var expect = common.expect;
var should = common.should;
var _ = require('lodash');

var Generator = require('../../lib/generator');
var Helpers = require('../../lib/modules/helpers');
var Java = require('../../lib/modules/java');
var module = require('../../lib/modules/java-8');
var generator;

var baseContext = {
  phase : 'decorate',
  spec : { },
  model : { }
}

function initContext(custom) {
  return _.assign(_.cloneDeep(baseContext), custom);
}

function emit() {
  var events = _.flatten(Array.prototype.slice.call(arguments, 0, -1));
  var context = arguments[arguments.length - 1];

  _.each(events, function(event) {
    generator.emit(context.phase, event, context);
  });
}

function initGenerator() {
  generator = new Generator()
    .use(Helpers, Java, module);
}

describe('init', function() {
  it('should be named correctly', function() {
    module.name.should.equal('Java8');
  });

  it('should depend on the Java module', function() {
    module.dependsOn.indexOf('Java').should.not.equal(-1);
  });
})

describe('property', function() {
  beforeEach(initGenerator);

  it('should ignore required properties', function() {
    var context = initContext({
      property : {
        type : 'string',
        required : true
      },
      propertyName : 'test'
    });
    emit('Context', 'Model', 'Property', context);
    expect(context.model.imports).to.not.include('java.util.Optional');
    expect(context.property.dataType).to.equal('String');
  });

  it('should surround non-required object properties with the Optional class', function() {
    context = initContext({
      property : {
        type : 'string',
        required : false
      },
      propertyName : 'test'
    });
    emit('Context', 'Model', 'Property', context);
    expect(context.model.imports).to.include('java.util.Optional');
    expect(context.property.dataType).to.equal('Optional<String>');
  });

  it('should change non-required 32-bit integer properties to OptionalInt', function() {
    context = initContext({
      property : {
        type : 'integer',
        required : false
      },
      propertyName : 'test'
    });
    emit('Context', 'Model', 'Property', context);
    expect(context.model.imports).to.include('java.util.OptionalInt');
    expect(context.property.dataType).to.equal('OptionalInt');
  });

  it('should change non-required 64-bit integer properties to OptionalLong', function() {
    context = initContext({
      property : {
        type : 'integer',
        format : 'int64',
        required : false
      },
      propertyName : 'test'
    });
    emit('Context', 'Model', 'Property', context);
    expect(context.model.imports).to.include('java.util.OptionalLong');
    expect(context.property.dataType).to.equal('OptionalLong');
  });

  it('should change non-required double properties to OptionalDouble', function() {
    context = initContext({
      property : {
        type : 'number',
        format : 'double',
        required : false
      },
      propertyName : 'test'
    });
    emit('Context', 'Model', 'Property', context);
    expect(context.model.imports).to.include('java.util.OptionalDouble');
    expect(context.property.dataType).to.equal('OptionalDouble');
  });
});