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

var _ = require('lodash');
var inflection = require('inflection');
var util = require('../utilities');

function assign(context, overides) {
  return _.assign({}, context, overides);
}

module.exports.name = 'Helpers';

module.exports.initialize = function() {
  this.onDecorate('Context', function(context) {
    context.operations = [];
    context.queryOperations = [];
  });

  this.onDecorate('Operation', function(context) {
    var operation = context.operation;
    var method = context.method;
    var spec = context.spec;
    operation.method = method.toUpperCase();

    if (!operation.operationId && context.path) {
      operation.operationId = method + inflection.camelize(context.path.replace(/[\/-]/g, '_'), true);
    }

    operation.resolvedConsumes = operation.consumes || spec.consumes;
    operation.resolvedProduces = operation.produces || spec.produces;

    operation.successResponse = util.getSuccessResponse(operation);
    operation.hasReturn = operation.successResponse != null;

    operation.parameters = this.resolveParameters(operation, context);

    operation.isQuery =
      operation.method == 'GET' &&
      operation.parameters &&
      operation.parameters.length > 2 &&
      _.find(operation.parameters, function(parameter) {
        return parameter.required == true || !_.includes(['query', 'header'], parameter.in);
      }) == null;

    operation.bodyParam      = _.find(operation.parameters, function(parameter) { return parameter.in == 'body'; });
    operation.pathParams     = _.filter(operation.parameters, function(parameter) { return parameter.in == 'path'; });
    operation.queryParams    = _.filter(operation.parameters, function(parameter) { return parameter.in == 'query'; });
    operation.headerParams   = _.filter(operation.parameters, function(parameter) { return parameter.in == 'header'; });
    operation.formParams     = _.filter(operation.parameters, function(parameter) { return parameter.in == 'formData'; });
    operation.requiredParams = _.filter(operation.parameters, function(parameter) { return parameter.required == true; });

    if (operation.isQuery) {
      context.queryOperations.push(operation);
      this.emit(context.phase, 'QueryOperation', assign(context, {
        operation : operation
      }));
    }

    _.assign(operation, {
      fullPath : (spec.basePath || '') + operation.path,
      accepts : util.getMimeType(operation.resolvedProduces) || 'application/json',
      contentType : _.includes(['GET', 'DELETE'], operation.method)
        ? null
        : (util.getMimeType(operation.resolvedConsumes) || 'application/json')
    });

    context.operations.push(operation);
  });

  this.onDecorate('Model', function(context) {
    var model = context.model;
    model.name = context.modelName;

    // Flatten composition and build reference links
    if (model.allOf) {
      model.references = model.references || [];
      model.required = model.required || [];
      model.properties = model.properties || {};

      _.each(model.allOf, function(schema) {
        if (schema.$ref) {
          var otherModel = util.resolveReference(schema, context.spec, context.references).obj;

          if (!_.includes(model.references, otherModel)) {
            model.references.push(otherModel);
          }

          otherModel.referencedBy = otherModel.referencedBy || [];
          if (!_.includes(otherModel.referencedBy, model)) {
            otherModel.referencedBy.push(model);
          }

          otherModel.recursiveReferencedBy = otherModel.recursiveReferencedBy || [];
          if (!_.includes(otherModel.recursiveReferencedBy, model)) {
            otherModel.recursiveReferencedBy.push(model);
          }

          recursiveAddReference(otherModel.references, model);
        } else {
          model.required = _.union(model.required, schema.required);
          _.assign(model.properties, schema.properties);
        }
      });
    }
    
    model.vars = _.values(model.properties);
  });

  this.onDecorate('Property', function(context) {
    var property = context.property;
    property.name = context.propertyName;
  });

  this.onPrepare('Model', function(context) {
    var model = context.model;

    if (model.required && model.properties) {
      _.each(model.properties, function(value, key) {
        value.required = _.includes(model.required, key);
      });
    }
  });

  this.onFinalize('Model', function(context) {
    var model = context.model;
    var required = context.required || model.required;
    var properties = context.properties || model.properties;

    model.vars = _.values(model.properties);

    var allProperties = {};
    var allRequired = [];
    var allReferences = [];
    appendAllProperties(model, allRequired, allProperties, allReferences);

    model.allRequired = allRequired;
    model.allProperties = allProperties;
    model.allVars = _.values(allProperties);
    model.allReferences = allReferences;
  });

  this.onWrite('Context', function(context) {
    _.each(context.queryOperations, _.bind(function(operation) {
      this.write('QueryOperation', operation);
    }, this));
  });
};

function recursiveAddReference(references, model) {
  _.each(references, function(reference) {
    reference.recursiveReferencedBy = reference.recursiveReferencedBy || [];

    if (!_.includes(reference.recursiveReferencedBy, model)) {
      reference.recursiveReferencedBy.push(model);
    }

    recursiveAddReference(reference.references, model);
  });
}

function appendAllProperties(model, allRequired, allProperties, allReferences) {
  _.each(model.references, function(model) {
    allReferences.push(model);
    appendAllProperties(model, allRequired, allProperties, allReferences);
  });

  allRequired.required = _.union(allRequired.required, model.required);
  _.assign(allProperties, model.properties);
}