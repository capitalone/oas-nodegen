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
var util = require('../utilities');

module.exports.name = 'JaxB';

module.exports.dependsOn = ['Java'];

module.exports.initialize = function() {
  this.addKnownImports(
    "javax.xml.bind.annotation.XmlRootElement",
    "javax.xml.bind.annotation.XmlType",
    "javax.xml.bind.annotation.XmlAccessType",
    "javax.xml.bind.annotation.XmlAccessorType",
    "javax.xml.bind.annotation.XmlSeeAlso",
    "javax.xml.bind.annotation.XmlElementWrapper",
    "javax.xml.bind.annotation.XmlElement"
  );

  this.onDecorate('Model', function(context) {
    var model = context.model;

    this.addImport('javax.xml.bind.annotation.XmlRootElement', model);
    this.addAnnotation('@XmlRootElement', model);

    this.addImport('javax.xml.bind.annotation.XmlAccessType', model);
    this.addImport('javax.xml.bind.annotation.XmlAccessorType', model);
    this.addAnnotation('@XmlAccessorType(XmlAccessType.FIELD)', model);
  });

  this.onDecorate('Property', function(context) {
    var model = context.model;
    var property = context.property;

    if (property.xml) {
      var name = property.xml.name || property.name;
      var namespace = property.xml.namespace;
      var annotationName;

      if (property.type == 'array' && property.xml.wrapped == true) {
        annotationName = 'XmlElementWrapper';
      } else if (property.type != 'array') {
        annotationName = 'XmlElement';
      }

      if (annotationName) {
        var annotation = '@' + annotationName + '(name=' + this.escapeJavaString(name) +
          (namespace != null ? ', namespace=' + this.escapeJavaString(namespace) : '') +
          ')';
        this.addImport('javax.xml.bind.annotation.' + annotationName, model);
        this.addAnnotation(annotation, property);
      }
    }

    if (property.type == 'array' && property.items && property.items.xml) {
      var name = property.items.xml.name || property.name;
      var namespace = property.items.xml.namespace;

      var annotation = '@XmlElement(name=' + this.escapeJavaString(name) +
        (namespace != null ? ', namespace=' + this.escapeJavaString(namespace) : '') +
        ')';
      this.addImport('javax.xml.bind.annotation.XmlElement', model);
      this.addAnnotation(annotation, property);
    }
  });

  this.onFinalize('Model', function(context) {
    var model = context.model;

    var namespace = this.config.modelXmlNamespace || 'http://api.swagger.io/v1/model';
    this.addImport('javax.xml.bind.annotation.XmlType', model);
    this.addAnnotation('@XmlType(propOrder = { ' + this.joinStrings(_.keys(model.properties)) + ' }, namespace = ' + this.escapeJavaString(namespace) + ')', model);

    if (model.recursiveReferencedBy) {
      this.addImport('javax.xml.bind.annotation.XmlSeeAlso', model);
      var see = _.chain(model.recursiveReferencedBy)
        .filter(function(r) { return r.packageName == model.packageName; })
        .map(function(r) { return r.classname + '.class'; })
        .value();
      this.addAnnotation('@XmlSeeAlso({ ' + see.join(', ') + ' })', model);
    }
  });
};