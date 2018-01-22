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
var module = require('../../lib/modules/helpers');
var generator;

var baseContext = {
  phase : 'decorate',
  spec : { },
  operation : { },
  model : { }
}

var model1 = {
  properties : {
    id : {
      type : 'string'
    },
    name : {
      type : 'string'
    }
  }
}
var model2 = {
  allOf : [
    {
      $ref : '#/definitions/Model1'
    }
  ],
  properties : {
    other2 : {
      type : 'string'
    }
  }
}
var model3 = {
  allOf : [
    {
      $ref : '#/definitions/Model2'
    }
  ],
  properties : {
    other3 : {
      type : 'string'
    }
  }
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
    .use(module);
}

describe('init', function() {
  it('should be named correctly', function() {
    module.name.should.equal('Helpers');
  });
})

describe('operation', function() {
  beforeEach(initGenerator);

  it('should resolve consumes and produces from the spec or operation', function() {
    var context = initContext({
      spec : {
        consumes : 'text/xml',
        produces : 'text/xml'
      },
      method : 'GET'
    });
    emit('Context', 'Operation', context);
    context.operation.resolvedConsumes.should.equal('text/xml');
    context.operation.resolvedProduces.should.equal('text/xml');

    context = initContext({
      operation : {
        consumes : 'text/xml',
        produces : 'text/xml'
      },
      method : 'GET'
    });
    emit('Context', 'Operation', context);
    context.operation.resolvedConsumes.should.equal('text/xml');
    context.operation.resolvedProduces.should.equal('text/xml');
  });

  it('should provide a simple property for the success response', function() {
    context = initContext({
      operation : {
        responses : {
          200 : {
            description : 'test'
          }
        }
      },
      method : 'GET'
    });
    emit('Context', 'Operation', context);
    context.operation.successResponse.description.should.equal('test');
  });

  it('should detect query operations', function() {
    var context = initContext({
      operation : {
        parameters : [
          {
            name : 'test1',
            in : 'query'
          },
          {
            name : 'test2',
            in : 'query'
          },
          {
            name : 'test3',
            in : 'query'
          }
        ]
      },
      method : 'GET'
    });
    var qoWrite = false;
    generator.onWrite('QueryOperation', function() {
      qoWrite = true;
    });
    emit('Context', 'Operation', context);
    generator.write('Context', context);
    context.operation.isQuery.should.equal(true);
    context.queryOperations.length.should.equal(1);
    qoWrite.should.equal(true);
  });

  it('should partion parameters by type', function() {
    var context = initContext({
      operation : {
        parameters : [
          {
            name : 'test1',
            in : 'body'
          },
          {
            name : 'test2',
            in : 'path'
          },
          {
            name : 'test3',
            in : 'query'
          },
          {
            name : 'test4',
            in : 'header'
          },
          {
            name : 'test5',
            in : 'formData'
          }
        ]
      },
      method : 'GET'
    });
    emit('Context', 'Operation', context);
    context.operation.bodyParam.should.not.equal(null);
    context.operation.bodyParam.name.should.equal('test1');
    context.operation.pathParams.length.should.equal(1);
    context.operation.pathParams[0].name.should.equal('test2');
    context.operation.queryParams.length.should.equal(1);
    context.operation.queryParams[0].name.should.equal('test3');
    context.operation.headerParams.length.should.equal(1);
    context.operation.headerParams[0].name.should.equal('test4');
    context.operation.formParams.length.should.equal(1);
    context.operation.formParams[0].name.should.equal('test5');
  });
});

describe('model', function() {
  beforeEach(initGenerator);

  it('should bring property information underneath an allOf composition up to the model', function() {
    var base = {
      spec: {
        definitions : {
          Model1 : model1,
          Model2 : model2
        }
      }
    }
    var context = initContext(base);
    context.phase = 'decorate';
    context.modelName = 'Model1';
    context.model = context.spec.definitions.Model1;
    emit('Model', context);
    context.modelName = 'Model2';
    context.model = context.spec.definitions.Model2;
    emit('Model', context);

    Object.keys(context.spec.definitions.Model2.properties).length.should.equal(1);
    context.spec.definitions.Model2.properties.other2.type.should.equal('string');
  });

  it('should build referenced by and recursive referenced by', function() {
    var base = {
      spec: {
        definitions : {
          Model1 : model1,
          Model2 : model2,
          Model3 : model3
        }
      }
    }
    var context = initContext(base);
    context.phase = 'decorate';
    context.modelName = 'Model1';
    context.model = context.spec.definitions.Model1;
    emit('Model', context);
    context.modelName = 'Model2';
    context.model = context.spec.definitions.Model2;
    emit('Model', context);
    context.modelName = 'Model3';
    context.model = context.spec.definitions.Model3;
    emit('Model', context);

    context.phase = 'finalize';
    context.modelName = 'Model1';
    context.model = context.spec.definitions.Model1;
    emit('Model', context);
    context.modelName = 'Model2';
    context.model = context.spec.definitions.Model2;
    emit('Model', context);
    context.modelName = 'Model3';
    context.model = context.spec.definitions.Model3;
    emit('Model', context);

    context.spec.definitions.Model1.recursiveReferencedBy.length.should.equal(2);
    context.spec.definitions.Model1.referencedBy.length.should.equal(1);
    context.spec.definitions.Model2.references.length.should.equal(1);
    context.spec.definitions.Model3.references.length.should.equal(1);
  });

  it('should build a map of all properties', function() {
    var base = {
      spec: {
        definitions : {
          Model1 : model1,
          Model2 : model2,
          Model3 : model3
        }
      }
    }
    var context = initContext(base);
    context.phase = 'decorate';
    context.modelName = 'Model1';
    context.model = context.spec.definitions.Model1;
    emit('Model', context);
    context.modelName = 'Model2';
    context.model = context.spec.definitions.Model2;
    emit('Model', context);
    context.modelName = 'Model3';
    context.model = context.spec.definitions.Model3;
    emit('Model', context);

    Object.keys(context.spec.definitions.Model1.allProperties).length.should.equal(2);
    Object.keys(context.spec.definitions.Model2.allProperties).length.should.equal(3);
    Object.keys(context.spec.definitions.Model3.allProperties).length.should.equal(4);
  });
});

describe('property', function() {
  beforeEach(initGenerator);

  it('should set the property name in the property object', function() {
    var context = initContext({
      property : {
        type : 'string',
        required : true
      },
      propertyName : 'test'
    });
    emit('Context', 'Model', 'Property', context);
    context.property.name.should.equal('test');
  });
});