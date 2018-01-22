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

module.exports.name = 'JavaBeanValidation';

module.exports.dependsOn = ['Java'];

module.exports.initialize = function() {
  this.addKnownImports(
    "javax.validation.constraints.DecimalMax",
    "javax.validation.constraints.DecimalMin",
    "javax.validation.constraints.Max",
    "javax.validation.constraints.Min",
    "javax.validation.constraints.NotNull",
    "javax.validation.constraints.Pattern",
    "javax.validation.constraints.Size",
    "javax.validation.Valid"
  );

  function commonAnnotations(model, property) {
    if (property.minimum) {
      if (property.exclusiveMinimum) {
        console.log("WARN: Property " + property.name + " has an exclusiveMinimum which is not supported by Java Bean Validation");
      }
      if (property.type == 'integer') {
        this.addImport("javax.validation.constraints.Min", model);
        this.addAnnotation('@Min(' + Math.floor(property.minimum) + ')', property);
      } if (property.type == 'number') {
        this.addImport("javax.validation.constraints.DecimalMin", model);
        this.addAnnotation('@DecimalMin(\"' + property.minimum + '\")', property);
      }
    }

    if (property.maximum) {
      if (property.exclusiveMaximum) {
        console.log("WARN: Property " + property.name + " has an exclusiveMaximum which is not supported by Java Bean Validation");
      }
      if (property.type == 'integer') {
        this.addImport("javax.validation.constraints.Max", model);
        this.addAnnotation('@Max(' + Math.floor(property.maximum) + ')', property);
      } if (property.type == 'number') {
        this.addImport("javax.validation.constraints.DecimalMax", model);
        this.addAnnotation('@DecimalMax(\"' + property.maximum + '\")', property);
      }
    }

    if (property.type == 'string' || property.type == 'array') {
      var annotation = '';

      if (property.minLength != null) {
        annotation = '@Size(';
        annotation += 'min=' + property.minLength;
      }

      if (property.maxLength != null) {
        annotation += (annotation.length == 0 ? '@Size(' : ', ');
        annotation += 'max=' + property.maxLength;
      }

      if (annotation.length > 0) {
        annotation += ')';
        this.addImport("javax.validation.constraints.Size", model);
        this.addAnnotation(annotation, property);
      }
    }

    if (property.type == 'string' && property.pattern != null) {
      this.addImport("javax.validation.constraints.Pattern", model);
      this.addAnnotation('@Pattern(regexp=' + this.escapeJavaString(property.pattern) + ')', property);
    }
  }

  this.onDecorate('Parameter', function(context) {
    var parameter = context.parameter;
    var resource = context.resource;

    if (parameter.in == 'body' && parameter.required) {
      this.addImport("javax.validation.Valid", resource);
      this.addAnnotation('@Valid', parameter);
    }
    else if (parameter.in != 'path' && parameter.required) {
      this.addImport("javax.validation.constraints.NotNull", resource);
      this.addAnnotation('@NotNull', parameter);
    }

    commonAnnotations.call(this, resource, parameter);
  });

  this.onDecorate('Property', function(context) {
    var property = context.property;
    var model = context.model;

    if (property.required) {
      this.addImport("javax.validation.constraints.NotNull", model);
      this.addAnnotation('@NotNull', property);
    }

    if (property.type != null) {
      commonAnnotations.call(this, model, property);

      if (property.type == 'array' && property.items.$ref != null) {
        this.addImport("javax.validation.Valid", model);
        this.addAnnotation('@Valid', property);
      }
    }
    else if (property.$ref != null) {
      this.addImport("javax.validation.Valid", model);
      this.addAnnotation('@Valid', property);
    }
  });
};