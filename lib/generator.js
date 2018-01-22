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
var EventEmitter = require('events');
var inflection = require('inflection');
var util = require('./utilities');
var Modules = require('./modules');

/**
 * Represents a Generator
 * @constructor
 * @param {object} config The configuration object (optional)
 */
function Generator(config) {
  Generator.init.apply(this, arguments);
}
module.exports = Generator;

// Valid HTTP methods
var validMethods = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch'];

Generator.init = function(config) {
  this.phases = ['prepare', 'decorate', 'finalize'];
  this.modules = null;
  this.ignoredOperations = [];
  this.ignoredParameters = [];
  this.registeredModules = [];
  this.validMethods = _.clone(validMethods);
  this.phaseEventEmitter = new EventEmitter();
  this.writeEventEmitter = new EventEmitter();

  this.configure(config);
}

/**
 * Adds configuration properties
 *
 * @param {object} config The configuration object
 * @returns same instance to allow chaining
 */
Generator.prototype.configure = function(config) {
  this.config = _.extend({
    processUnreferencedModels : true
  }, config);

  return this; // Allow chaining
}

/**
 * Adds known ignored operation names
 *
 * @param {string[]} operationNames The list of operation names
 * @returns same instance to allow chaining
 */
Generator.prototype.addIgnoredOperations = function() {
  var args = _.flatten(arguments);
  this.ignoredOperations = _.union(this.ignoredOperations, args);

  return this; // Allow chaining
}

/**
 * Adds known ignored parameters names
 *
 * @param {string[]} parameterNames The list of parameter names
 * @returns same instance to allow chaining
 */
Generator.prototype.addIgnoredParameters = function() {
  var args = _.flatten(arguments);
  this.ignoredParameters = _.union(this.ignoredParameter, args);

  return this; // Allow chaining
}

/**
 * Sets the internal Modules object to use for resolving modules
 *
 * @param {string[]} parameters The list of parameter names
 * @returns same instance to allow chaining
 */
Generator.prototype.setModules = function(modules) {
  this.modules = modules;

  return this; // Allow chaining
}

/**
 * Loads modules and their dependencies
 *
 * @param {string[]|object[]} moduleNamesOrObjects Module objects or names to load
 * @returns same instance to allow chaining
 */
Generator.prototype.use = function() {
  var args = _.flatten(arguments);
  args = _.map(args, _.bind(function(module) {
    if (_.isString(module)) {
      // Initialize an internal Modules instance if not already set
      //
      if (this.modules == null) {
        this.modules = new Modules();
      }

      module = this.modules.get(module);
    }

    return module;
  }, this));
  // Flatten again because Modules.get returns an array of resolved modules.
  //
  args = _.flatten(args);

  for (var i = 0; i < args.length; i++) {
    var module = args[i];

    // Prevent re-registration
    //
    if (!_.includes(this.registeredModules, module.name)) {
      if (!_.isEmpty(module.dependsOn)) {
        for (var j=0; j<module.dependsOn.length; j++) {
          // Verify dependencies are registered
          //
          if (!_.includes(this.registeredModules, module.dependsOn[j])) {
            throw new Error(module.name + ' depends on ' + module.dependsOn[j] + ' which is not loaded.');
          }
        }
      }

      this.registeredModules.push(module.name);
      module.initialize.call(this, this);
    }
  }

  return this; // Allow chaining
}

////// EVENTING

/**
 * Emits an event for a given specification scope.
 *
 * @param {string} phase The phase name
 * @param {string} event The event name
 * @param {object} data The data object to emit
 * @returns same instance to allow chaining
 */
Generator.prototype.emit = function(phase, event, data) {
  this.phaseEventEmitter.emit(phase + '::' + event, data);

  return this; // Allow chaining
}

/**
 * Registers a listener for a given phase and event.
 *
 * @param {string} phase The phase name
 * @param {string} event The event name
 * @param {object} data The data object to emit
 * @returns same instance to allow chaining
 */
Generator.prototype.on = function(phase, event, listener) {
  this.phaseEventEmitter.on(phase + '::' + event, _.bind(listener, this));

  return this; // Allow chaining
}

/**
 * Shorthand method to register a listener for 'prepare' phase and given event.
 *
 * @param {string} event The event name
 * @param {function} listener The callback listener function
 * @returns same instance to allow chaining
 */
Generator.prototype.onPrepare = function(event, listener) {
  return this.on('prepare', event, listener);
}

/**
 * Shorthand method to register a listener for 'decorate' phase and given event.
 *
 * @param {string} event The event name
 * @param {function} listener The callback listener function
 * @returns same instance to allow chaining
 */
Generator.prototype.onDecorate = function(event, listener) {
  return this.on('decorate', event, listener);
}

/**
 * Shorthand method to register a listener for 'finalize' phase and given event.
 *
 * @param {string} event The event name
 * @param {function} listener The callback listener function
 * @returns same instance to allow chaining
 */
Generator.prototype.onFinalize = function(event, listener) {
  return this.on('finalize', event, listener);
}

/**
 * Emits a write event
 *
 * @param {string} event The event name
 * @param {object} data The data to write
 * @returns same instance to allow chaining
 */
Generator.prototype.write = function(event, data) {
  this.writeEventEmitter.emit.apply(this.writeEventEmitter, arguments);

  return this; // Allow chaining
}

/**
 * Shorthand method to register a write listener for given event.
 *
 * @param {string} event The event name
 * @param {function} listener The callback listener function
 * @returns same instance to allow chaining
 */
Generator.prototype.onWrite = function(event, listener) {
  this.writeEventEmitter.on(event, _.bind(listener, this));

  return this; // Allow chaining
}

////// PROCESSING

/**
 * Processes the specification.
 *
 * @param {object|object[]} specs One or many specifications loaded by the `Loader`
 * @param {object} references (Optional) A manually loaded set of references
 */
Generator.prototype.process = function(specs, references) {
  if (!_.isArray(specs)) {
    specs = [specs];
  }

  var references = _.clone(references || specs[0].$references, true);
  var base = {
    processedModels: {},
    models: {},
    resources: {},
    references: references
  };

  // Make deep copies so we can decorate the specs without affecting the originals.
  //
  specs = _.map(specs, function(spec) {
    spec = _.clone(spec, true);
    delete spec.$references;
    spec.initial = true;
    return spec;
  });

  // Step 1: Grouping
  // Groups operations into resources and groups
  // (e.g. resource = Pets resource, group = Pets Collection)
  //
  base.phase = 'grouping';
  _.each(specs, function(spec) {
    var context = _.assign({}, {
      initialSpec: spec,
      spec: spec
    }, base);
    //context.phase = 'grouping';
    this._group(context.spec, context);
  }.bind(this));
  base.models = util.sortKeys(base.models);

  // Step 2: Decorate
  // Iterate and call processing methods for each phase
  //
  _.each(this.phases, function(phase) {
    // Clear the model lookup at the beginning of each phase
    //
    base.processedModels = {};

    // Process the context (called only once)
    //
    base.phase = phase;
    this.emit(phase, 'Context', base);

    _.each(specs, function(spec) {
      var context = _.assign({}, {
        initialSpec: spec,
        spec: spec
      }, base);

      // Process main spec...
      //
      this.emit(context.phase, 'Specification', context);

      // ...then process referenced specs
      //
      _.each(context.references.sub, _.bind(function(spec, location) {
        this.emit(context.phase, 'Specification', assign(context, { spec : spec, location : location }));
      }, this));

      _.each(spec.paths, _.bind(function(pathItem, path) {
        if (path.startsWith('/')) {
          var resolved = util.resolveReference(pathItem, context.spec, context.references);

          this._processPathItem(assign(context, {
            path : path,
            pathItem : resolved.obj,
            spec : resolved.spec
          }));
        }
      }, this));

      // Process unreferenced model definitions
      //
      if (this.config.processUnreferencedModels) {
        _.each(spec.definitions, _.bind(function(model, name) {
          this._processModel(assign(context, {
            modelName : name,
            model : model
          }));
        }, this));
      }
    }.bind(this));

    // Process resources and groups
    //
    _.each(base.resources, _.bind(function(resource) {
      var context = _.assign({}, {
        initialSpec: resource.spec,
        spec: resource.spec,
        resource: resource
      }, base);
      this.emit(base.phase, 'Resource', context);

      _.each(resource.groups, _.bind(function(group) {
        var context = _.assign({}, {
          initialSpec: group.spec,
          spec: group.spec,
          resource: resource,
          group: group
        }, base);
        this.emit(base.phase, 'Group', context);
      }, this));
    }, this));
  }.bind(this));

  // Step 3: Write
  // Invoke callbacks that handle writing generator code to disk
  //
  base.phase = 'write';
  this.write('Context', base);

  _.each(specs, function(spec) {
    var context = _.assign({}, {
      initialSpec : spec,
      spec : spec
    }, base);
    _.assign(context, base);
    this._write(context);
  }.bind(this));
}

////// GROUPING

/**
 * Groups all the specification's operations into resources and groups.
 *
 * @private
 * @param {object} spec The specification loaded by the `Loader`
 * @param {object} context The processing context
 */
Generator.prototype._group = function(spec, context) {
  this._groupOperations(spec, context);

  context.resources = util.sortKeys(context.resources);

  _.each(context.resources, _.bind(function(resource) {
    // Sort groups
    //
    var keys = _.keys(resource.groups);
    keys = _.sortBy(keys, this.groupSort);

    var sorted = {};

    _.each(keys, _.bind(function(key) {
      var group = resource.groups[key];
      group.operations = _.sortBy(group.operations, this.operationSort);
      sorted[key] = resource.groups[key];
    }, this));

    resource.groups = sorted;

    // Sort operations
    //
    resource.operations = _.sortBy(resource.operations, this.operationSort);
  }, this));
}

/**
 * Traverses all paths to handle path items
 *
 * @private
 * @param {object} spec The specification loaded by the `Loader`
 * @param {object} context The processing context
 */
Generator.prototype._groupOperations = function(spec, context) {
  _.each(spec.paths, _.bind(function(methods, path) {
    if (path.startsWith('/')) {
      var resolved = util.resolveReference(methods, context.spec, context.references);
      this._groupPathItem(resolved.obj, path, resolved.spec, context);
    }
  }, this));
}

/**
 * Traverses all path items to handle operations
 *
 * @private
 * @param {object} pathItem The path item
 * @param {string} path The path
 * @param {object} spec The specification loaded by the `Loader`
 * @param {object} context The processing context
 */
Generator.prototype._groupPathItem = function(pathItem, path, spec, context) {
  _.each(pathItem, _.bind(function(operation, method) {
    if (_.includes(this.validMethods, method)) {
      var resolved = util.resolveReference(operation, spec, context.references);
      var operation = resolved.obj;
      operation.path = path;

      if (!_.includes(this.ignoredOperations, operation['x-resource-operation'] || operation.operationId)) {
        this._groupOperation(operation, resolved.spec, context);
      } else {
        // Even if we filter out the operation, make sure the resource is created
        var grouping = this.groupOperation(operation);
        var resourceName = grouping.resourceName;
        this._ensureResource(resourceName, spec, context);
      }
    }
  }, this));
}

/**
 * Ensures that a resource is registered with the context
 *
 * @private
 * @param {string} resourceName The resource name
 * @param {object} context The processing context
 */
Generator.prototype._ensureResource = function(resourceName, spec, context) {
  // Create a new resource object if it does not already exist
  //
  var resource = context.resources[resourceName];
  if (!resource) {
    resource = {
      name: resourceName,
      basePath: context.spec.basePath,
      produces: context.initialSpec.produces,
      consumes: context.initialSpec.consumes,
      operations: [],
      groups: {},
      spec: spec
    };

    context.resources[resourceName] = resource;
  }

  return resource;
}

/**
 * Adds an operation into a resource and group designated by the `groupOperation` method.
 *
 * @private
 * @para, {object} operation The operation object
 * @param {object} spec The specification loaded by the `Loader`
 * @param {object} context The processing context
 */
Generator.prototype._groupOperation = function(operation, spec, context) {
  var grouping = this.groupOperation(operation);
  var resourceName = grouping.resourceName;
  var groupName = grouping.groupName;

  resource = this._ensureResource(resourceName, spec, context);

  // Create a new group object if one does not already exist
  //
  var group = resource.groups[groupName];
  if (!group) {
    group = {
      name : groupName,
      basePath : context.spec.basePath,
      produces : context.initialSpec.produces,
      consumes : context.initialSpec.consumes,
      operations : [],
      spec: spec
    };

    resource.groups[groupName] = group;
  }

  resource.operations.push(operation);
  group.operations.push(operation);
}

////// DECORATION

/**
 * Shorthand function to assign an existing context and overrides into a new context object.
 *
 * @private
 * @param {object} context The context object
 * @param {object} overrides An object with properties to override in the context
 * @returns a new context object containing the overriden properties
 */
function assign(context, overrides) {
  return _.assign({}, context, overrides);
}

/**
 * Internal method to traverse a path item.
 *
 * @private
 * @param {object} context The context object
 */
Generator.prototype._processPathItem = function(context) {
  _.each(context.pathItem, _.bind(function(operation, method) {
    if (!_.includes(this.ignoredOperations, operation['x-resource-operation'] || operation.operationId)) {
      var resolved = util.resolveReference(operation, context.spec, context.references);
      var operation = resolved.obj;

      // This dirties up the original spec here but its necessary for grouping
      //
      operation.path = context.path;

      var grouping = this.groupOperation(operation);
      var resourceName = grouping.resourceName;
      var groupName = grouping.groupName;

      var resource = context.resources[resourceName];
      var group = resource != null
        ? resource.groups[groupName]
        : null;
  
      // Process operation
      //
      this._processOperation(assign(context, {
        method : method,
        operation : operation,
        resource : resource,
        group : group,
        spec : resolved.spec
      }));
    }
  }, this));

  // Process the path item
  //
  this.emit(context.phase, 'PathItem', context);
}

/**
 * Internal method to filter out ignored parameters.
 *
 * @private
 * @param {object} operation The operation object
 * @param {object} context The context object
 * @returns a list of filtered parameter references
 */
Generator.prototype.filterParameters = function(operation, context) {
  return _
      .chain(operation.parameters)
      .map(function(parameter) {
        return util.resolveReference(parameter, context.spec, context.references);
      }.bind(this))
      .filter(function(resolved) {
        return !_.includes(this.ignoredParameters, resolved.obj.name);
      }.bind(this));
}

/**
 * Internal method to filter out ignored parameters and return the resolved operation objects.
 *
 * @private
 * @param {object} operation The operation object
 * @param {object} context The context object
 * @returns a list of filtered parameter objects
 */
Generator.prototype.resolveParameters = function(operation, context) {
  return this.filterParameters(operation, context)
      .map(function(resolved) { return resolved.obj; })
      .value();
}

/**
 * Internal method to traverse an operation.
 *
 * @private
 * @param {object} context The context object
 */
Generator.prototype._processOperation = function(context) {
  var operation = context.operation;
  var method = context.method;

  if (_.includes(this.validMethods, method)) {
    this.emit(context.phase, 'Operation', context);

    var parameters = this.filterParameters(operation, context).value();

    // Process parameters
    //
    _.each(parameters, function(resolved) {
      this._processParameter(assign(context, {
        parameter : resolved.obj,
        spec : resolved.spec
      }));
    }.bind(this));

    // Process responses
    _.each(operation.responses, _.bind(function(response, code) {
      this._processResponse(assign(context, {
        code : code,
        response : response
      }));
    }, this));
  }
}

/**
 * Internal method to traverse a parameter.
 *
 * @private
 * @param {object} context The context object
 */
Generator.prototype._processParameter = function(context) {
  var parameter = context.parameter;

  // Process referenced model
  //
  if (parameter.schema && parameter.schema.$ref) {
    var name = util.extractModelName(parameter.schema.$ref);
    var resolved = util.resolveReference(parameter.schema, context.spec, context.references);

    this._processModel(assign(context, {
      modelName : name,
      model : resolved.obj,
      spec : resolved.spec
    }));
  }

  this.emit(context.phase, 'Parameter', context);
}

/**
 * Internal method to traverse a response.
 *
 * @private
 * @param {object} context The context object
 */
Generator.prototype._processResponse = function(context) {
  var response = context.response;

  // Process referenced model
  //
  if (response.schema && response.schema.$ref) {
    var name = util.extractModelName(response.schema.$ref);
    var resolved = util.resolveReference(response.schema, context.spec, context.references);

    this._processModel(assign(context, {
      modelName : name,
      model : resolved.obj,
      spec : resolved.spec
    }));
  }

  this.emit(context.phase, 'Response', context);
}

/**
 * Internal method to traverse a model.
 *
 * @private
 * @param {object} context The context object
 */
Generator.prototype._processModel = function(context) {
  var model = context.model;
  var name = context.modelName;

  if (context.processedModels[name] != null) {
    return;
  }

  context.processedModels[name] = context.models[name] = model;

  if (model.allOf) {
    // Process all references first...
    //
    _.each(model.allOf, _.bind(function(schema) {
      if (schema.$ref) {
        var modelName = util.extractModelName(schema.$ref);
        var resolved = util.resolveReference(schema, context.spec, context.references);

        this._processModel(assign(context, {
          modelName : modelName,
          model : resolved.obj,
          spec : resolved.spec,
          required : null,
          properties : null
        }));
      }
    }, this));
    // ...then the model's own schema
    //
    this.emit(context.phase, 'Model', context);
    _.each(model.allOf, _.bind(function(schema) {
      if (!schema.$ref) {
        this._processModelSchema(assign(context, {
          required : schema.required,
          properties : schema.properties
        }));
      }
    }, this));
  } else {
    this.emit(context.phase, 'Model', context);
    this._processModelSchema(assign(context, {
      required : null,
      properties : null
    }));
  }
}

/**
 * Internal method to traverse a model's schema.
 *
 * @private
 * @param {object} context The context object
 */
Generator.prototype._processModelSchema = function(context) {
  var model = context.model;
  var properties = context.properties || model.properties;

  this._processProperties(context, properties);
}

/**
 * Internal method to traverse a model's schema.
 *
 * @private
 * @param {object} context The context object
 */
Generator.prototype._processProperties = function(context, properties) {
  var model = context.model;

  if (properties) {
    _.each(properties, _.bind(function(property, propertyName) {
      this._processProperty(assign(context, {
        property : property,
        propertyName : propertyName
      }));

      // If property refers to another model, process that model
      //
      if (property.$ref) {
        var modelName = util.extractModelName(property.$ref);
        var resolved = util.resolveReference(property, context.spec, context.references);

        this._processModel(assign(context, {
          model : resolved.obj,
          modelName : modelName,
          spec : resolved.spec
        }));
      } else if (property.type == 'array' && property.items && property.items.$ref) {
        var modelName = util.extractModelName(property.items.$ref);
        var resolved = util.resolveReference(property.items, context.spec, context.references);

        this._processModel(assign(context, {
          model : resolved.obj,
          modelName : modelName,
          spec : resolved.spec
        }));
      }
    }, this));
  }
}

/**
 * Internal method to traverse a model's property.
 *
 * @private
 * @param {object} context The context object
 */
Generator.prototype._processProperty = function(context) {
  this.emit(context.phase, 'Property', context);
}

////// WRITING

/**
 * Internal method to emit write events for the specification
 *
 * @private
 * @param {object} context The context object
 */
Generator.prototype._write = function(context) {
  var spec = context.spec;

  // Write main spec
  //
  this.write('Specification', spec, context);

  // Write referenced specs
  //
  _.each(context.references, _.bind(function(spec) {
    this.write('Specification', spec, context);
  }, this));

  // Write models
  //
  _.each(context.models, _.bind(function(model, name) {
    this.write('Model', model, name, context);
  }, this));

  // Write resources
  //
  _.each(context.resources, _.bind(function(resource, name) {
    this.write('Resource', resource, name, context);
  }, this));
}

////// GROUPING HELPERS

/**
 * Internal hook that determines the resource and group names for grouping.
 * This method can be overriden with by custom logic.
 *
 * @param {object} operation The operation object
 * @returns the resource and group names object.
 */
Generator.prototype.groupOperation = function(operation) {
  // First, try to base the resource name off the first tag
  //
  var resourceName = (operation.tags && operation.tags.length > 0) ? util.capitalize(operation.tags[0]) : null;

  // Fallback on the first slug of the URI
  //
  if (resourceName == null) {
    resourceName = operation.path;

    while (resourceName.startsWith('/')) resourceName = resourceName.substring(1);
    resourceName = resourceName.split('/')[0];
  }

  resourceName = util.capitalize(inflection.singularize(inflection.classify(resourceName.replace(/\-/g, '_'))));

  var groupName = resourceName;
  var compressed = operation.path.replace(/\//g, '').replace(/\{[\w]+\}/g, '_');
  var firstVariable = compressed.indexOf('_');
  var lastVariable = compressed.lastIndexOf('_');

  // Append group name suffix if applicable
  //
  if (firstVariable == -1) {
    groupName = inflection.pluralize(groupName) + ' Collection';
  } else if (firstVariable != -1 && (!compressed.endsWith('_') || lastVariable > firstVariable)) {
    groupName +=  ' Actions';
  }

  return {
    resourceName : resourceName,
    groupName : groupName
  }
}

/**
 * Internal hook that returns a order index used to sort group names.
 * This method can be overriden with by custom logic.
 *
 * @param {string} group The group name
 * @returns the sort index based on the group name
 */
Generator.prototype.groupSort = function(group) {
  // Sort resource groups by [Collection, Entity, Actions]
  //
  if (group.endsWith(" Collection")) {
    return 1;
  } else if (group.endsWith(" Actions")) {
    return 3;
  } else {
    return 2;
  }
}

/**
 * Internal hook that returns a order index used to sort operations.
 * This method can be overriden with by custom logic.
 * This implementation sorts by length of the URI after variables are stripped out.
 *
 * @param {object} operation The operation object
 * @returns the sort index based on the operation
 */
Generator.prototype.operationSort = function(operation) {
  var compressed = operation.path.replace(/\//g, '').replace(/\{[\w]+\}/g, '_');

  return compressed.length;
}
