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
var module = require('../../lib/modules/java');

var generator;

var baseContext = {
  phase : 'decorate',
  spec : { },
  resource : { },
  method: 'GET',
  operation : {
    operationId : 'GetFooById',
    responses : {
      200 : {
        description : 'Testing',
        schema : {
          $ref : '#/definitions/Test'
        }
      }
    }
  },
  model: {
    name : 'test',
    imports : [],
    vars : [
      {
        name : 'prop1'
      },
      {
        name : 'prop2'
      }
    ]
  },
  operations : [ ]
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
    .use(Helpers, module);
}

describe('init', function() {
  it('should be named correctly', function() {
    module.name.should.equal('Java');
  });

  it('should depend on the Helpers module', function() {
    module.dependsOn.indexOf('Helpers').should.not.equal(-1);
  });
});

describe('utilities', function() {
  beforeEach(initGenerator);

  it('should escape java strings', function() {
    generator.escapeJavaString('\\\r\n\t\"').should.equal('"\\\\r\\n\\t\\""');
  });

  it('should calculate simple class names', function() {
    generator.getSimpleClassName('com.company.Test').should.equal('Test');
  });

  it('should calculate simple class names', function() {
    generator.getSimpleClassName('com.company.Test').should.equal('Test');
  });

  it('should join strings with each escaped', function() {
    generator.joinStrings(['one', 'two', 'three']).should.equal('"one", "two", "three"');
  });
});

describe('imports', function() {
  beforeEach(initGenerator);

  it('should add imports to an array or object with imports property', function() {
    var thing = {
      package : 'com.test',
      imports : []
    };
    generator.addImport('com.company.Other', thing);
    thing.imports[0].should.equal('com.company.Other');

    var imports = [];
    generator.addImport('com.company.Other', imports);
    imports[0].should.equal('com.company.Other');
    generator.addImport('com.company.Other', imports);
    imports.length.should.equal(1);
  });

  it('should not add an import to a class under the same package', function() {
    var thing = {
      package : 'com.test',
      imports : []
    };
    generator.addImport('com.test.Other', thing);
    thing.imports.length.should.equal(0);
  });

  it('should sort all collected imports', function() {
    var imports = ['C', 'B', 'A'];
    var context = {
      phase : 'finalize',
      resource: {
        imports : imports
      }
    };
    generator.emit(context.phase, 'Resource', context);
    imports.length.should.equal(3);
    imports[0].should.equal('A');
    imports[1].should.equal('B');
    imports[2].should.equal('C');

    imports = ['C', 'B', 'A'];
    var context = {
      phase : 'finalize',
      model: {
        imports : imports
      }
    };
    generator.emit(context.phase, 'Model', context);
    imports.length.should.equal(3);
    imports[0].should.equal('A');
    imports[1].should.equal('B');
    imports[2].should.equal('C');
  });

  it('should resolve known imports if simple class name is passed', function() {
    expect(function() {
      var imports = [];
      generator.addImport('Thing', imports);
    }).to.throw('Thing is not a known import');

    generator.addKnownImports(['org.test.Thing']);
    var imports = [];
    generator.addImport('Thing', imports);
    imports[0].should.equal('org.test.Thing');
  });
});

describe('annotations', function() {
  beforeEach(initGenerator);

  it('should add annotations to an array or object with annotations property', function() {
    var thing = {
      annotations : []
    };
    generator.addAnnotation(null, thing);
    thing.annotations.length.should.equal(0);
    generator.addAnnotation('Test', null);
    thing.annotations.length.should.equal(0);
    generator.addAnnotation('Test', thing);
    thing.annotations[0].should.equal('@Test');

    var annotations = [];
    generator.addAnnotation('@Test', annotations);
    annotations[0].should.equal('@Test');
    generator.addAnnotation('@Test', annotations);
    annotations.length.should.equal(1);
  });
});

describe('type translation', function() {
  beforeEach(initGenerator);

  it('should use type and format to determine the class using lookups', function() {
    var imports = [];
    expect(generator.translateType(null, imports)).to.equal(null);

    var property = {
      type : 'string'
    };
    var type = generator.translateType(property, imports);
    type.should.equal('String');
  });

  it('should wrap array types with List or Set', function() {
    var imports = [];
    var property = {
      type : 'array',
      items : {
        type : 'string'
      }
    };
    var type = generator.translateType(property, imports);
    type.should.equal('List<String>');
    imports[0].should.equal('java.util.List');
    property.uniqueItems = true;
    type = generator.translateType(property, imports);
    type.should.equal('Set<String>');
    imports[1].should.equal('java.util.Set');
  });

  it('should handle objects', function() {
    var imports = [];
    var property = {
      $ref : '#/definitions/Test'
    };
    var spec = {
      definitions: {
        Test: {}
      }
    };
    var context = { spec: spec, references: {}};
    var type = generator.translateType(property, imports, context);
    type.should.equal('Test');

    var parameter = {
      schema : {
        $ref : '#/definitions/Test'
      }
    };
    type = generator.translateType(parameter, imports, context);
    type.should.equal('Test');
  });

  it('should handle collections of objects', function() {
    var imports = [];
    var property = {
      type : 'array',
      items : {
        $ref : '#/definitions/Test'
      }
    };
    var type = generator.translateType(property, imports);
    type.should.equal('List<Test>');
  });

  it('should convert schemas with additionalProperties to maps', function() {
    var imports = [];
    var property = {
      type : 'object',
      additionalProperties : {
        type : 'string'
      }
    };
    var type = generator.translateType(property, imports);
    type.should.equal('Map<String, String>');

    property = {
      type : 'object',
      additionalProperties : {
        $ref : '#/definitions/Test'
      }
    };
    type = generator.translateType(property, imports);
    type.should.equal('Map<String, Test>');
  });

  it('should leverage custom type translator functions', function() {
    var imports = [];
    var property = {
      name : 'Test'
    };
    generator.addTypeTranslator(function(property, imports) {
      if (property.name == 'Test') {
        return 'Translated';
      }
    });
    var type = generator.translateType(property, imports);
    type.should.equal('Translated');
  });

  it('should return void is no type is declared', function() {
    var imports = [];
    var property = {};
    var type = generator.translateType(property, imports);
    type.should.equal('void');
  });
});

describe('operation', function() {
  beforeEach(initGenerator);

  it('should generate a method name', function() {
    var context = initContext();
    generator.emit(context.phase, 'Operation', context);
    context.operation.methodName.should.equal('getFooById');
  });

  it('should calculate a property for the return type and description', function() {
    var context = initContext();
    generator.emit(context.phase, 'Operation', context);
    context.operation.returnType.should.equal('Test');
    context.operation.returnDescription.should.equal('Testing');
  });
});

describe('parameter', function() {
  beforeEach(initGenerator);

  it('should set properties for annotations, dataType, itemType, and method', function() {
    var context = initContext({
      resource : {
        name : 'Test'
      },
      parameter : {
        name : 'Test',
        in : 'query',
        type : 'string'
      }
    });
    generator.emit(context.phase, 'Parameter', context);
    context.parameter.annotations.length.should.equal(0);
    context.parameter.dataType.should.equal('String');
    expect(context.parameter.itemType).to.equal(null);
    context.parameter.method.should.equal('setQuery');

    context = initContext({
      resource : {
        name : 'Test'
      },
      parameter : {
        name : 'Test',
        in : 'query',
        type : 'array',
        items : {
          type : 'string'
        }
      }
    });
    generator.emit(context.phase, 'Parameter', context);
    context.parameter.annotations.length.should.equal(0);
    context.parameter.dataType.should.equal('List<String>');
    expect(context.parameter.itemType).to.equal('String');
    context.parameter.method.should.equal('setQuery');
  });
});

describe('resource', function() {
  beforeEach(initGenerator);

  it('should set properties for package, imports, annotations, and class name', function() {
    var context = initContext({
      resource : {
        name : 'Test'
      }
    });
    generator.emit(context.phase, 'Resource', context);
    context.resource.imports.length.should.equal(0);
    context.resource.annotations.length.should.equal(0);
    context.resource.package.should.equal('io.swagger.resource');
    context.resource.classname.should.equal('Test');

    generator.config.package = 'org.company1';
    generator.emit(context.phase, 'Resource', context);
    context.resource.package.should.equal('org.company1');

    generator.config.resourcePackage = 'org.company2';
    generator.emit(context.phase, 'Resource', context);
    context.resource.package.should.equal('org.company2');
  });
});

describe('model', function() {
  beforeEach(initGenerator);

  it('should set properties for package, imports, annotations, and class name', function() {
    var context = initContext({
      modelName : 'Test',
      model : {
        type : 'string'
      }
    });
    generator.config.package = 'io.swagger.model';
    generator.emit(context.phase, 'Model', context);
    context.model.imports.length.should.equal(0);
    context.model.annotations.length.should.equal(0);
    context.model.package.should.equal('io.swagger.model');
    context.model.classname.should.equal('Test');

    generator.config.modelPackage = 'org.company1';
    generator.emit(context.phase, 'Model', context);
    context.model.package.should.equal('org.company1');
  });

  it('should add imports to referenced model classes outside the package and set the parent', function() {
    var context = initContext({
      modelName : 'Test',
      model : {
        allOf : [
          {
            $ref : '#/definitions/Other'
          },
          {
            properties : {
              test : {
                type : 'string'
              }
            }
          }
        ]
      },
      spec : {
        definitions : {
          Other : {
            package : 'com.company1',
            name : 'Other'
          }
        }
      }
    });
    generator.config.package = 'io.swagger.model';
    generator.emit(context.phase, 'Model', context);
    context.model.imports[0].should.equal('com.company1.Other');
    context.model.parent.should.equal('Other');
  });

  it('should generate a serialVersionUID', function() {
    var context = initContext({
      phase : 'finalize'
    });
    generator.emit(context.phase, 'Model', context);
    context.model.serialVersionUID.should.not.equal(null);
  });
});

describe('property', function() {
  beforeEach(initGenerator);

  it('should set properties for annotations, dataType, defaultValue, getter, and setter', function() {
    var context = initContext({
      propertyName : 'test',
      property : {
        type : 'string'
      }
    });
    generator.emit(context.phase, 'Property', context);
    context.property.annotations.length.should.equal(0);
    context.property.dataType.should.equal('String');
    expect(context.property.defaultValue).to.equal(undefined);
    context.property.getter.should.equal('getTest');
    context.property.setter.should.equal('setTest');

    context = initContext({
      propertyName : 'test',
      property : {
        type : 'string',
        default: 'testDefault'
      }
    });
    generator.emit(context.phase, 'Property', context);
    expect(context.property.defaultValue).to.equal('"testDefault"');

    context = initContext({
      propertyName : 'test',
      property : {
        type : 'integer',
        default: '123'
      }
    });
    generator.emit(context.phase, 'Property', context);
    expect(context.property.defaultValue).to.equal('123');

    context = initContext({
      propertyName : 'test',
      property : {
        type : 'boolean'
      }
    });
    generator.emit(context.phase, 'Property', context);
    context.property.dataType.should.equal('Boolean');
    context.property.getter.should.equal('isTest');
    context.property.setter.should.equal('setTest');

    context = initContext({
      propertyName : 'hasTest',
      property : {
        type : 'boolean'
      }
    });
    generator.emit(context.phase, 'Property', context);
    context.property.dataType.should.equal('Boolean');
    context.property.getter.should.equal('getHasTest');
    context.property.setter.should.equal('setHasTest');
  });

  it('should set declare a class to represent any enumerations', function() {
    var context = initContext({
      propertyName : 'Test',
      property : {
        type : 'string',
        enum : ['test1', 'test2', 'test3']
      },
      enums: {}
    });
    generator.emit(context.phase, 'Property', context);
    context.property.dataType.should.equal('TestEnum');
    context.property.getter.should.equal('getTest');
    context.property.setter.should.equal('setTest');
  });
});