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
var module = require('../../lib/modules/jax-rs');
var generator;

var baseContext = {
  phase : 'decorate',
  spec : { },
  resource : { }
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
    module.name.should.equal('JaxRS');
  });

  it('should depend on the Java module', function() {
    module.dependsOn.indexOf('Java').should.not.equal(-1);
  });
})

describe('resources', function() {
  beforeEach(initGenerator);

  it('should add the @Path annotation to the resource', function() {
    var context = initContext();
    emit('Resource', context);
    expect(context.resource.imports).to.include('javax.ws.rs.Path');
    expect(context.resource.annotations).to.include('@Path("/")');
  });

  it('should add the @Consumes annotation to the resource if defined at top level', function() {
    var context = initContext();
    emit('Resource', context);
    expect(context.resource.imports).to.not.include('javax.ws.rs.Consumes');
    context.resource.annotations.length.should.equal(1);

    context.resource.consumes = ['application/json'];
    emit('Resource', context);
    expect(context.resource.imports).to.include('javax.ws.rs.Consumes');
    expect(context.resource.annotations).to.include('@Consumes({ "application/json" })');

    context.resource.consumes = ['application/json', 'text/xml'];
    emit('Resource', context);
    expect(context.resource.imports).to.include('javax.ws.rs.Consumes');
    expect(context.resource.annotations).to.include('@Consumes({ "application/json", "text/xml" })');
  });

  it('should add the @Produces annotation to the resource if defined at top level', function() {
    var context = initContext();
    generator.emit(context.phase, 'Resource', context);
    expect(context.resource.imports).to.not.include('javax.ws.rs.Produces');
    context.resource.annotations.length.should.equal(1);

    context.resource.produces = ['application/json'];
    emit('Resource', context);
    expect(context.resource.imports).to.include('javax.ws.rs.Produces');
    expect(context.resource.annotations).to.include('@Produces({ "application/json" })');

    context.resource.produces = ['application/json', 'text/xml'];
    emit('Resource', context);
    expect(context.resource.imports).to.include('javax.ws.rs.Produces');
    expect(context.resource.annotations).to.include('@Produces({ "application/json", "text/xml" })');
  });
});

describe('operation', function() {
  beforeEach(initGenerator);

  it('should add the @GET/POST/PUT/DELETE annotation to the operation', function() {
    _.each(['GET', 'POST', 'PUT', 'DELETE'], function(method) {
      var context = initContext({
        method : method,
        operation : {
          operationId : 'test'
        }
      });

      emit('Context', 'Resource', 'Operation', context);
      expect(context.resource.imports).to.include('javax.ws.rs.' + method);
      expect(context.operation.annotations).to.include('@' + method);
    });
  });

  it('should add an annotation that handles the PATCH method to the operation', function() {
    var context = initContext({
      method : 'PATCH',
      operation : {
        operationId : 'test'
      }
    });

    emit('Context', 'Resource', 'Operation', context);
    expect(context.resource.imports).to.include('javax.ws.rs.HttpMethod');
    expect(context.operation.annotations).to.include('@HttpMethod("PATCH")');

    generator.config = _.extend(generator.config, {
      patchImport : 'mycustom.PATCH',
      patchAnnotation : '@PATCH'
    });
    var context = initContext({
      method : 'PATCH',
      operation : {
        operationId : 'test'
      }
    });

    emit('Context', 'Resource', 'Operation', context);
    expect(context.resource.imports).to.include('mycustom.PATCH');
    expect(context.operation.annotations).to.include('@PATCH');
  });

  it('should add the @Path annotation to the operation if defined', function() {
    var context = initContext({
      method : 'GET',
      operation : {
        operationId : 'test',
        path : '/test'
      }
    });
    emit('Context', 'Resource', 'Operation', context);
    expect(context.resource.imports).to.include('javax.ws.rs.Path');
    expect(context.operation.annotations).to.include('@Path("/test")');
  });

  it('should add the @Consumes annotation to the operation if defined', function() {
    var context = initContext({
      method : 'GET',
      operation : {
        operationId : 'test'
      }
    });
    emit('Context', 'Resource', 'Operation', context);
    expect(context.resource.imports).to.not.include('javax.ws.rs.Consumes');
    context.operation.annotations.length.should.equal(1);

    context.operation.consumes = ['application/json'];
    emit('Context', 'Resource', 'Operation', context);
    expect(context.resource.imports).to.include('javax.ws.rs.Consumes');
    expect(context.operation.annotations).to.include('@Consumes({ "application/json" })');

    context.operation.consumes = ['application/json', 'text/xml'];
    emit('Context', 'Resource', 'Operation', context);
    expect(context.resource.imports).to.include('javax.ws.rs.Consumes');
    expect(context.operation.annotations).to.include('@Consumes({ "application/json", "text/xml" })');
  });

  it('should add the @Produces annotation to the operation if defined', function() {
    var context = initContext({
      method : 'GET',
      operation : {
        operationId : 'test'
      }
    });
    emit('Context', 'Resource', 'Operation', context);
    expect(context.resource.imports).to.not.include('javax.ws.rs.Produces');
    context.operation.annotations.length.should.equal(1);

    context.operation.produces = ['application/json'];
    emit('Context', 'Resource', 'Operation', context);
    expect(context.resource.imports).to.include('javax.ws.rs.Produces');
    expect(context.operation.annotations).to.include('@Produces({ "application/json" })');

    context.operation.produces = ['application/json', 'text/xml'];
    emit('Context', 'Resource', 'Operation', context);
    expect(context.resource.imports).to.include('javax.ws.rs.Produces');
    expect(context.operation.annotations).to.include('@Produces({ "application/json", "text/xml" })');
  });
});

describe('parameter', function() {
  beforeEach(initGenerator);

  it('should add @PathParam annotations to parameters in the path', function() {
    var context = initContext({
      parameter : {
        name : 'test',
        in : 'path'
      }
    });
    emit('Context', 'Resource', 'Parameter', context);
    expect(context.resource.imports).to.include('javax.ws.rs.PathParam');
    expect(context.parameter.annotations).to.include('@PathParam("test")');
  });

  it('should add @QueryParam annotations to parameters in the query string', function() {
    var context = initContext({
      parameter : {
        name : 'test',
        in : 'query'
      }
    });
    emit('Context', 'Resource', 'Parameter', context);
    expect(context.resource.imports).to.include('javax.ws.rs.QueryParam');
    expect(context.parameter.annotations).to.include('@QueryParam("test")');
  });

  it('should add @HeaderParam annotations to parameters in the headers', function() {
    var context = initContext({
      parameter : {
        name : 'test',
        in : 'header'
      }
    });
    emit('Context', 'Resource', 'Parameter', context);
    expect(context.resource.imports).to.include('javax.ws.rs.HeaderParam');
    expect(context.parameter.annotations).to.include('@HeaderParam("test")');
  });

  it('should add @FormParam annotations to parameters in a form body', function() {
    var context = initContext({
      parameter : {
        name : 'test',
        in : 'formData'
      }
    });
    emit('Context', 'Resource', 'Parameter', context);
    expect(context.resource.imports).to.include('javax.ws.rs.FormParam');
    expect(context.parameter.annotations).to.include('@FormParam("test")');
  });

  it('should add @DefaultValue annotations to parameters that have default values defined', function() {
    var context = initContext({
      parameter : {
        name : 'test',
        default : 1234
      }
    });
    emit('Context', 'Resource', 'Parameter', context);
    expect(context.resource.imports).to.include('javax.ws.rs.DefaultValue');
    expect(context.parameter.annotations).to.include('@DefaultValue("1234")');
  });
});