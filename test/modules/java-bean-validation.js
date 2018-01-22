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
var _ = require('lodash');

var Generator = require('../../lib/generator');
var Helpers = require('../../lib/modules/helpers');
var Java = require('../../lib/modules/java');
var module = require('../../lib/modules/java-bean-validation');
var generator;

var baseContext = {
  phase : 'decorate',
  spec : { },
  resource : { },
  model : {}
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
    module.name.should.equal('JavaBeanValidation');
  });

  it('should depend on the Java module', function() {
    module.dependsOn.indexOf('Java').should.not.equal(-1);
  });
});

describe('parameter', function() {
  beforeEach(initGenerator);

  it('should add a @Valid annotation to the body parameter', function() {
    var context = initContext({
      parameter : {
        name : 'test',
        in : 'body',
        type : 'string',
        required : false
      }
    });
    emit('Context', 'Resource', 'Parameter', context);
    expect(context.resource.imports).to.not.include('javax.validation.Valid');
    context.parameter.annotations.length.should.equal(0);

    context = initContext({
      parameter : {
        name : 'test',
        in : 'body',
        type : 'string',
        required : true
      }
    });
    emit('Context', 'Resource', 'Parameter', context);
    expect(context.resource.imports).to.include('javax.validation.Valid');
    expect(context.parameter.annotations).to.include('@Valid');
  });

  it('should add a @NotNull annotation to required non-body parameters', function() {
    var context = initContext({
      parameter : {
        name : 'test',
        in : 'body',
        type : 'string',
        required : false
      }
    });
    emit('Context', 'Resource', 'Parameter', context);
    expect(context.resource.imports).to.not.include('javax.validation.constraints.NotNull');
    context.parameter.annotations.length.should.equal(0);

    context = initContext({
      parameter : {
        name : 'test',
        in : 'header',
        type : 'string',
        required : true
      }
    });
    emit('Context', 'Resource', 'Parameter', context);
    expect(context.resource.imports).to.include('javax.validation.constraints.NotNull');
    expect(context.parameter.annotations).to.include('@NotNull');
  });
});

describe('property', function() {
  beforeEach(initGenerator);

  it('should add a @NotNull annotation to each required property', function() {
    var context = initContext({
      property : {
        in : 'body',
        type : 'string',
        required : false
      },
      propertyName : 'test'
    });
    emit('Context', 'Model', 'Property', context);
    expect(context.model.imports).to.not.include('javax.validation.constraints.NotNull');
    context.property.annotations.length.should.equal(0);

    context = initContext({
      property : {
        in : 'header',
        type : 'string',
        required : true
      },
      propertyName : 'test'
    });
    emit('Context', 'Model', 'Property', context);
    expect(context.model.imports).to.include('javax.validation.constraints.NotNull');
    expect(context.property.annotations).to.include('@NotNull');
  });

  it('should add @Min and @Max annotations to integer properties', function() {
    var context = initContext({
      property : {
        in : 'query',
        type : 'integer'
      },
      propertyName : 'test'
    });
    emit('Context', 'Model', 'Property', context);
    expect(context.model.imports).to.not.include('javax.validation.constraints.Min');
    expect(context.model.imports).to.not.include('javax.validation.constraints.Max');
    context.property.annotations.length.should.equal(0);

    context = initContext({
      property : {
        in : 'query',
        type : 'integer',
        minimum : 1,
        maximum : 20
      },
      propertyName : 'test'
    });
    emit('Context', 'Model', 'Property', context);
    expect(context.model.imports).to.include('javax.validation.constraints.Min');
    expect(context.model.imports).to.include('javax.validation.constraints.Max');
    expect(context.property.annotations).to.include('@Min(1)');
    expect(context.property.annotations).to.include('@Max(20)');
  });

  it('should add @DecimalMin and @DecimalMax annotations to number properties', function() {
    var context = initContext({
      property : {
        in : 'query',
        type : 'number'
      },
      propertyName : 'test'
    });
    emit('Context', 'Model', 'Property', context);
    expect(context.model.imports).to.not.include('javax.validation.constraints.DecimalMin');
    expect(context.model.imports).to.not.include('javax.validation.constraints.DecimalMax');
    context.property.annotations.length.should.equal(0);

    context = initContext({
      property : {
        in : 'query',
        type : 'number',
        minimum : 1.234,
        maximum : 56.789
      },
      propertyName : 'test'
    });
    emit('Context', 'Model', 'Property', context);
    expect(context.model.imports).to.include('javax.validation.constraints.DecimalMin');
    expect(context.model.imports).to.include('javax.validation.constraints.DecimalMax');
    expect(context.property.annotations).to.include('@DecimalMin("1.234")');
    expect(context.property.annotations).to.include('@DecimalMax("56.789")');
  });

  it('should add a @Size annotation to string and array properties', function() {
    var context = initContext({
      property : {
        type : 'string'
      },
      propertyName : 'test'
    });
    emit('Context', 'Model', 'Property', context);
    expect(context.model.imports).to.not.include('javax.validation.constraints.Size');
    context.property.annotations.length.should.equal(0);

    context = initContext({
      property : {
        type : 'string',
        minLength : 1
      },
      propertyName : 'test'
    });
    emit('Context', 'Model', 'Property', context);
    expect(context.model.imports).to.include('javax.validation.constraints.Size');
    expect(context.property.annotations).to.include('@Size(min=1)');

    context = initContext({
      property : {
        type : 'string',
        maxLength : 10
      },
      propertyName : 'test'
    });
    emit('Context', 'Model', 'Property', context);
    expect(context.model.imports).to.include('javax.validation.constraints.Size');
    expect(context.property.annotations).to.include('@Size(max=10)');

    context = initContext({
      property : {
        type : 'string',
        minLength : 1,
        maxLength : 10
      },
      propertyName : 'test'
    });
    emit('Context', 'Model', 'Property', context);
    expect(context.model.imports).to.include('javax.validation.constraints.Size');
    expect(context.property.annotations).to.include('@Size(min=1, max=10)');
  });

  it('should add a @Pattern annotation to string properties with patterns', function() {
    var context = initContext({
      property : {
        type : 'string'
      },
      propertyName : 'test'
    });
    emit('Context', 'Model', 'Property', context);
    expect(context.model.imports).to.not.include('javax.validation.constraints.Pattern');
    context.property.annotations.length.should.equal(0);

    context = initContext({
      property : {
        type : 'string',
        pattern : 'test'
      },
      propertyName : 'test'
    });
    emit('Context', 'Model', 'Property', context);
    expect(context.model.imports).to.include('javax.validation.constraints.Pattern');
    expect(context.property.annotations).to.include('@Pattern(regexp="test")');
  });

  it('should add a @Valid annotation to properties with references', function() {
    var context = initContext({
      property : {
        type : 'string'
      },
      propertyName : 'test'
    });
    emit('Context', 'Model', 'Property', context);
    expect(context.model.imports).to.not.include('javax.validation.Valid');
    context.property.annotations.length.should.equal(0);

    context = initContext({
      property : {
        $ref : '#/definitions/Test'
      },
      propertyName : 'test'
    });
    emit('Context', 'Model', 'Property', context);
    expect(context.model.imports).to.include('javax.validation.Valid');
    expect(context.property.annotations).to.include('@Valid');
  });
});