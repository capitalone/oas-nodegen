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

var _ = require('lodash');
var inflection = require('inflection');
var util = require('../utilities');

module.exports.name = 'Java';

module.exports.dependsOn = ['Helpers'];

module.exports.initialize = function() {
  this.translateTypeMap = {
    // Standard type values
    'integer' : 'Integer',
    'number' : 'Double',
    'string' : 'String',
    'boolean' : 'Boolean',
    'File' : 'File',
    // Non-standard values that can be assigned in x-type but not type
    'any' : 'Object',
    'currency' : 'BigDecimal',
    'percentage' : 'BigDecimal'
  };

  this.translateFormatMap = {
    'int32' : 'Integer',
    'int64' : 'Long',
    'float' : 'Float',
    'double' : 'Double',
    'byte' : 'String',
    'date' : 'LocalDate',
    'date-time' : 'LocalDateTime',
    'currency' : 'BigDecimal',
    'percentage' : 'BigDecimal'
  };

  this.imports = [
    'java.math.BigDecimal',
    'java.util.List',
    'java.util.Map',
    'java.util.Set',
    'java.time.Instant',
    'java.time.LocalDate',
    'java.time.LocalDateTime',
    'java.io.InputStream'
  ];

  this.convertMap = {
    'File' : 'InputStream'
  };

  this.paramTypeMap = {
    'formData' : 'form'
  };

  this.primativeToObjectMap = {
    'int': 'Integer',
    'long': 'Long',
    'float': 'Float',
    'double': 'Double'
  };

  this.forceBooleanGetPrefixes = ['is', 'has'];

  this.convertEnums = true;
  this.enumSuffix = 'Enum';

  this.addImport = function(className, imports) {
    if (!className || !imports) {
      return;
    }

    var origClassName = className;
    className = this.findImport(className);

    if (!className) {
      throw new Error(origClassName + ' is not a known import');
    }

    var package = imports.package || '';

    if (_.isObject(imports) && !_.isArray(imports)) {
      imports = imports.imports = imports.imports || [];
    }

    var otherPackage = className ? className.substring(0, className.lastIndexOf('.')) : 'other';

    if (package != otherPackage && !_.includes(imports, className)) {
      imports.push(className);
    }
  }

  this.addAnnotation = function(annotation, annotations) {
    if (!annotation || !annotations) {
      return;
    }

    if (_.isObject(annotations) && !_.isArray(annotations)) {
      annotations = annotations.annotations = annotations.annotations || [];
    }

    if (!annotation.startsWith('@')) {
      annotation = '@' + annotation;
    }

    if (!_.includes(annotations, annotation)) {
      annotations.push(annotation);
    }
  }

  this.joinStrings = function(values) {
    return _.map(values, _.bind(function(v) { return this.escapeJavaString(v); }, this)).join(', ');
  }

  this.addKnownImports = function() {
    var imports = _.flatten(arguments);
    this.imports = _.union(this.imports, imports);

    return this; // Allow chaining
  }

  this.findImport = function(simpleName) {
    if (!simpleName || simpleName.indexOf('.') != -1) {
      return simpleName;
    }

    return _.find(this.imports, function(importItem) {
      return importItem.endsWith('.' + simpleName);
    });
  }

  this.typeTranslators = [];

  this.addTypeTranslator = function(translator) {
    this.typeTranslators.push(translator);

    return this; // Allow chaining
  }

  this.overrideModelPackage = function($ref, resolved) {
    return null;
  }

  this.translateType = function(schema, imports, context) {
    if (schema == null) {
      return null;
    }

    var type = null;

    _.each(this.typeTranslators, _.bind(function(translator) {
      type = translator.call(this, schema, imports);
      return type != null;
    }, this));

    if (type != null) {
      this.addImport(this.findImport(type), imports);
      return type;
    }

    var modelPackage = this.config.modelPackage || this.config.package || 'io.swagger.model';

    var schemaType = schema['x-type'] || schema.type;

    if (schemaType) {
      if (schemaType == 'array') {
        type = schema.uniqueItems ? 'Set' : 'List';
        this.addImport('java.util.' + type, imports);

        if (schema.items) {
          if (schema.items.$ref) {
            var itemClass = util.capitalize(util.extractModelName(schema.items.$ref));
            this.addImport(modelPackage + '.' + itemClass, imports);
            type += '<' + itemClass + '>';
          } else {
            var itemClass = this.translateType(schema.items, imports, context);
            itemClass = util.translate(itemClass, this.primativeToObjectMap);
            type += '<' + itemClass + '>';
          }
        }
      } else if (schema.additionalProperties) {
        this.addImport('java.util.Map', imports);

        if (schema.additionalProperties.$ref) {
          var itemClass = util.capitalize(util.extractModelName(schema.additionalProperties.$ref));
          this.addImport(modelPackage + '.' + itemClass, imports);
          type = 'Map<String, ' + itemClass + '>';
        } else {
          var itemClass = this.translateType(schema.additionalProperties, imports, context);
          itemClass = util.translate(itemClass, this.primativeToObjectMap);
          type = 'Map<String, ' + itemClass + '>';
        }
      } else if (this.convertEnums && schemaType == 'string' && schema.enum) {
        var v = 1;
        var values = _.map(schema.enum, function(value) {
          return {
            name: this.enumName(value),
            value: value,
            valueEscaped: this.escapeJavaString(value),
            number: v++
          };
        }.bind(this));

        var enumName = schema['x-enum-name'] || context.propertyName || schema.name;
        var enumType = this.typeName(enumName) + this.enumSuffix;
        this.addImport(modelPackage + '.' + enumType, imports);

        if (!context.enums[enumType]) {
          var enumeration = {
            package: this.config.modelPackage || 'io.swagger.model',
            name: enumType,
            values: values
          };
          var existing = context.enums[enumType];
          if (existing) {
            if (JSON.stringify(existing) != JSON.stringify(enumeration)) {
              console.log('WARNING: Conflicting enumeration "' + enumType + '" detected. ');
            }
          }
          context.enums[enumType] = enumeration;
        }

        type = enumType;
      } else {
        type = util.translate(schemaType, this.translateTypeMap, type);
        var schemaFormat = schema['x-format'] || schema.format;
        type = util.translate(schemaFormat, this.translateFormatMap, type);
        type = util.translate(type, this.convertMap);
        var foundImport = this.findImport(type);
        if (foundImport) {
          this.addImport(foundImport, imports);
        }
      }
    // schema.$ref needed for response
    } else if (schema.$ref || (schema.schema && schema.schema.$ref)) {
      var $ref = schema.$ref || schema.schema.$ref;
      type = util.capitalize(util.extractModelName($ref));
      var resolved = util.resolveReference(schema.schema || schema, context.spec, context.references);

      if (resolved != null) {
        modelPackage = this.overrideModelPackage($ref, resolved) || modelPackage;
      }

      this.addImport(modelPackage + '.' + type, imports);
    } else {
      type = "void";
    }

    return type;
  }

  this.typeName = function(value) {
    return util.capitalize(inflection.camelize(value.replace(/\-/, '_')));
  }

  this.enumName = function(value) {
    value = value.replace(/\-/g, '_');
    value = value.replace(/[^a-zA-Z1-9_ ]/g, '');
    value = value.replace(/\s+/g, ' ');
    value = value.replace(/ /g, '_');
    return util.capitalize(inflection.camelize(value));
  }

  this.variableName = function(value) {
    return inflection.camelize(value.replace(/\-/, '_'), true);
  }

  this.escapeJavaString = function(value) {
    return '\"' + value
            .replace(/\\/g, '\\')
            .replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n')
            .replace(/\t/g, '\\t')
            .replace(/\"/g, '\\\"')
             + '\"';
  }

  this.getSimpleClassName = function(value) {
    var dot = value.lastIndexOf('.');

    if (dot != -1) {
      value = value.substring(dot + 1);
    }

    return value;
  }

  this.generateSerialVersionUID = function(value) {
    var hash = 0, i, chr, len;

    for (i = 0, len = value.length; i < len; i++) {
      chr   = value.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      //hash |= 0; // Convert to 32bit integer
    }

    return hash;
  }

  this.onPrepare('Context', function(context) {
    context.enums = {};
  });

  this.onDecorate('Operation', function(context) {
    var operation = context.operation;
    var resource = context.resource;

    var okResponse = operation.successResponse || {};
    var returnType = this.translateType(okResponse.schema, resource, context) || 'void';
    var hasReturn = returnType != 'void';
    var returnDescription = hasReturn ? okResponse.description : null;

    _.assign(operation, {
      annotations : [],
      methodName : operation['x-resource-operation'] || inflection.camelize(operation.operationId.replace(/[\s]+/g, '_'), true),
      returnType : returnType,
      hasReturn : hasReturn,
      returnDescription : returnDescription
    });
  });

  this.onDecorate('Parameter', function(context) {
    var parameter = context.parameter;
    var resource = context.resource;

    _.assign(parameter, {
      annotations : [],
      varname : this.variableName(parameter.name),
      dataType : this.translateType(parameter, resource, context),
      itemType : (parameter.items != null) ? this.translateType(parameter.items, this.translateTypeMap, context) : null,
      method : 'set' + util.capitalize(util.translate(parameter.in, this.paramTypeMap)),
    });
  });

  this.onDecorate('Resource', function(context) {
    var resource = context.resource;

    resource.imports = resource.imports || [];
    resource.annotations = resource.annotations || [];

    _.assign(resource, {
      package : this.config.resourcePackage || this.config.package || 'io.swagger.resource',
      classname : util.capitalize(resource.name)
    });
  });

  this.onDecorate('Model', function(context) {
    var model = context.model;
    var name = context.modelName;
    var package = this.config.modelPackage || 'io.swagger.model';

    model.imports = model.imports || [];
    model.annotations = model.annotations || [];

    _.assign(model, {
      package : package,
      classname : util.capitalize(name)
    });

    if (model.references && model.references.length > 0) {
      model.parent = util.capitalize(model.references[0].name);

      _.each(model.references, _.bind(function(reference) {
        if (reference.package && reference.name) {
          this.addImport(reference.package + '.' + reference.name, model);  
        }
      }, this));
    }
  });

  this.onDecorate('Property', function(context) {
    var property = context.property;
    var model = context.model;

    var getPrefix = _.find(this.forceBooleanGetPrefixes, function(prefix) {
      return property.name.startsWith(prefix);
    });

    var clone = _.assign({}, model, {
      imports: []
    });
    var propertyType = this.translateType(property, clone, context);

    _.each(clone.imports, function(_import) {
      this.addImport(_import, model);
    }.bind(this));

    _.assign(property, {
      annotations : [],
      varname : this.variableName(property.name),
      dataType : propertyType,
      imports : clone.imports,
      getter : (property.type == 'boolean' && getPrefix == null ? 'is' : 'get') + util.capitalize(property.name),
      setter : 'set' + util.capitalize(property.name)
    });

    if (property.default != undefined) {
      property.defaultValue = property.dataType == 'String'
        ? this.escapeJavaString(property.default)
        : (property.enum ? util.capitalize(property.name) + 'Enum.' : '') + property.default;
    }
  });

  this.onWrite('Context', function(context) {
    _.each(context.enums, function(enumeration, enumName) {
      this.write('Enum', enumeration, enumName, context);
    }.bind(this));
  });

  this.onFinalize('Resource', function(context) {
    var resource = context.resource;
    resource.imports = resource.imports || [];
    resource.imports.sort();
  });

  this.onFinalize('Model', function(context) {
    var model = context.model;
    model.imports = model.imports || [];
    model.imports.sort();

    model.allImports = _(model.allVars)
      .map(function(item) { return item.imports; })
      .filter(function(item) { return item != null; })
      .flatten()
      .union(model.imports)
      .sort()
      .value();

    var fingerprint = model.name + '>' + (model.parent || 'object') + '|' + _.map(model.vars, function(v) { return v.name; }).join(',');
    model.serialVersionUID = this.generateSerialVersionUID(fingerprint);
  });
}