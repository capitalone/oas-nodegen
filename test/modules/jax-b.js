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
var module = require('../../lib/modules/jax-b');
var generator;

var baseContext = {
  phase : 'decorate',
  spec : { },
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
    module.name.should.equal('JaxB');
  });

  it('should depend on the Java module', function() {
    module.dependsOn.indexOf('Java').should.not.equal(-1);
  });
});

describe('model', function() {
  beforeEach(initGenerator);

  it('should add @XmlRootElement, @XmlType, and @XmlAccessorType annotations to the model', function() {
    var base = {
      model : {
        properties : {
          id : {
            type : 'string'
          },
          name : {
            type : 'string'
          }
        }
      }
    }
    var context = initContext(base);
    emit('Model', context);
    context.phase = 'finalize';
    emit('Model', context);
    expect(context.model.imports).to.include('javax.xml.bind.annotation.XmlRootElement');
    expect(context.model.imports).to.include('javax.xml.bind.annotation.XmlType');
    expect(context.model.imports).to.include('javax.xml.bind.annotation.XmlAccessType');
    expect(context.model.imports).to.include('javax.xml.bind.annotation.XmlAccessorType');
    expect(context.model.annotations).to.include('@XmlRootElement');
    expect(context.model.annotations).to.include('@XmlType(propOrder = { "id", "name" }, namespace = "http://api.swagger.io/v1/model")');

    var context = initContext(base);
    generator.config.modelXmlNamespace = 'http://my.test.com/v1/model';
    emit('Model', context);
    context.phase = 'finalize';
    emit('Model', context);
    expect(context.model.annotations).to.include('@XmlType(propOrder = { "id", "name" }, namespace = "http://my.test.com/v1/model")');
  });

  it('should add an @XmlSeeAlso annotation to the model if referenced by other models (inheritance)', function() {
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
      properties : {
        name : {
          type : 'string'
        }
      }
    }
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

    context.phase = 'finalize';
    context.modelName = 'Model1';
    context.model = context.spec.definitions.Model1;
    emit('Model', context);
    context.modelName = 'Model2';
    context.model = context.spec.definitions.Model2;
    emit('Model', context);
    expect(context.spec.definitions.Model2.imports).to.not.include('javax.xml.bind.annotation.XmlSeeAlso');

    model2 = {
      allOf : [
        {
          $ref : '#/definitions/Model1'
        }
      ],
      properties : {
        name : {
          type : 'string'
        }
      }
    }
    base.spec.definitions.Model2 = model2;

    context = initContext(base);
    context.phase = 'decorate';
    context.modelName = 'Model1';
    context.model = context.spec.definitions.Model1;
    emit('Model', context);
    context.modelName = 'Model2';
    context.model = context.spec.definitions.Model2;
    emit('Model', context);

    context.phase = 'finalize';
    context.modelName = 'Model1';
    context.model = context.spec.definitions.Model1;
    emit('Model', context);
    context.modelName = 'Model2';
    context.model = context.spec.definitions.Model2;
    emit('Model', context);

    expect(context.spec.definitions.Model1.imports).to.include('javax.xml.bind.annotation.XmlSeeAlso');
    expect(context.spec.definitions.Model1.annotations).to.include('@XmlSeeAlso({ Model2.class })');
  });
});

describe('property', function() {
  beforeEach(initGenerator);

  it('should add an @XmlElementWrapper to collection properties that define an XML object with wrapped=true', function() {
    var model1 = {
      properties : {
        animals : {
          type : 'array',
          items: {
            type: 'string'
          },
          xml: {
            wrapped: true
          }
        },
        other : {
          type : 'array',
          items: {
            type: 'string'
          },
          xml: {
            wrapped: true,
            name: 'mammals',
            namespace: 'http://ns.test.com'
          }
        }
      }
    };

    var base = {
      spec: {
        definitions : {
          Model1 : model1
        }
      }
    }

    var context = initContext(base);
    context.phase = 'decorate';
    context.modelName = 'Model1';
    context.model = context.spec.definitions.Model1;
    emit('Model', context);
    context.propertyName = 'animals';
    context.property = context.spec.definitions.Model1.properties.animals;
    emit('Property', context);
    context.propertyName = 'other';
    context.property = context.spec.definitions.Model1.properties.other;
    emit('Property', context);

    expect(context.spec.definitions.Model1.imports).to.include('javax.xml.bind.annotation.XmlElementWrapper');
    expect(context.spec.definitions.Model1.properties.animals.annotations).to.include('@XmlElementWrapper(name="animals")');
    expect(context.spec.definitions.Model1.properties.other.annotations).to.include('@XmlElementWrapper(name="mammals", namespace="http://ns.test.com")');
  });

  it('should add an @XmlElement to collection properties that define an XML object under items', function() {
    var model1 = {
      properties : {
        animals : {
          type : 'array',
          items: {
            type: 'string',
            xml: {
              name: 'animal'
            }
          }
        }
      }
    };

    var base = {
      spec: {
        definitions : {
          Model1 : model1
        }
      }
    }

    var context = initContext(base);
    context.phase = 'decorate';
    context.modelName = 'Model1';
    context.model = context.spec.definitions.Model1;
    emit('Model', context);
    context.propertyName = 'animals';
    context.property = context.spec.definitions.Model1.properties.animals;
    emit('Property', context);

    expect(context.spec.definitions.Model1.imports).to.include('javax.xml.bind.annotation.XmlElement');
    expect(context.spec.definitions.Model1.properties.animals.annotations).to.include('@XmlElement(name="animal")');
  });
});