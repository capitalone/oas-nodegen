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

module.exports.name = 'JaxRS';

module.exports.dependsOn = ['Java'];

module.exports.initialize = function() {
  this.addKnownImports(
    "javax.ws.rs.Path",
    "javax.ws.rs.Consumes",
    "javax.ws.rs.Produces",
    "javax.ws.rs.PathParam",
    "javax.ws.rs.QueryParam",
    "javax.ws.rs.HeaderParam",
    "javax.ws.rs.FormParam",
    "javax.ws.rs.DefaultValue"
  );

  this.onDecorate('Resource', function(context) {
    var resource = context.resource;

    this.addImport('javax.ws.rs.Path', resource);
    this.addAnnotation('@Path(' + this.escapeJavaString(
        (resource.basePath || '') +
        (resource.uriName != null ? '/' + resource.uriName : '')) + ')', resource);

    if (!_.isEmpty(resource.consumes)) {
      this.addImport('javax.ws.rs.Consumes', resource);
      this.addAnnotation('@Consumes({ ' + this.joinStrings(resource.consumes) + ' })', resource);
    }

    if (!_.isEmpty(resource.produces)) {
      this.addImport('javax.ws.rs.Produces', resource);
      this.addAnnotation('@Produces({ ' + this.joinStrings(resource.produces) + ' })', resource);
    }
  });

  this.onDecorate('Operation', function(context) {
    var operation = context.operation;
    var resource = context.resource;

    if (operation.method == 'PATCH') {
      this.addImport(this.config.patchImport || 'javax.ws.rs.HttpMethod', resource);
      this.addAnnotation(this.config.patchAnnotation || '@HttpMethod("PATCH")', operation);
    } else {
      this.addImport('javax.ws.rs.' + operation.method, resource);
      this.addAnnotation('@' + operation.method, operation);
    }

    if (operation.path != null) {
      var path = operation.path;
      
      if (resource.uriName != null && path.startsWith('/' + resource.uriName)) {
        path = path.substring(resource.uriName.length + 1);
      }

      if (path.length == "/") {
        path = ""
      }
      
      if (path.length > 0) {
        this.addImport('javax.ws.rs.Path', resource);
        this.addAnnotation('@Path(' + this.escapeJavaString(path) + ')', operation);
      }
    }

    if (!_.isEmpty(operation.consumes)) {
      this.addImport('javax.ws.rs.Consumes', resource);
      this.addAnnotation('@Consumes({ ' + this.joinStrings(operation.consumes) + ' })', operation);
    }

    if (!_.isEmpty(operation.produces)) {
      this.addImport('javax.ws.rs.Produces', resource);
      this.addAnnotation('@Produces({ ' + this.joinStrings(operation.produces) + ' })', operation);
    }
  });

  this.onDecorate('Parameter', function(context) {
    var parameter = context.parameter;
    var resource = context.resource;

    if (parameter.in == 'path') {
      this.addImport('javax.ws.rs.PathParam', resource);
      this.addAnnotation('@PathParam(\"' + parameter.name + '\")', parameter);
    }
    else if (parameter.in == 'query') {
      this.addImport('javax.ws.rs.QueryParam', resource);
      this.addAnnotation('@QueryParam(\"' + parameter.name + '\")', parameter);
    }
    else if (parameter.in == 'header') {
      this.addImport('javax.ws.rs.HeaderParam', resource);
      this.addAnnotation('@HeaderParam(\"' + parameter.name + '\")', parameter);
    }
    else if (parameter.in == 'formData') {
      this.addImport('javax.ws.rs.FormParam', resource);
      this.addAnnotation('@FormParam(\"' + parameter.name + '\")', parameter);
    }

    if (parameter.default != undefined) {
      this.addImport('javax.ws.rs.DefaultValue', resource);
      this.addAnnotation('@DefaultValue(\"' + parameter.default + '\")', parameter);
    }
  });
};