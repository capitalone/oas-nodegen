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
var util = require('../utilities');

module.exports.name = 'Java8';

module.exports.dependsOn = ['Java'];

module.exports.initialize = function() {
  this.addKnownImports(
    "java.util.Optional",
    "java.util.OptionalInt",
    "java.util.OptionalLong",
    "java.util.OptionalDouble"
  );
  
  this.onDecorate('Property', function(context) {
    var property = context.property;
    var model = context.model;

    if (!property.required) {
      property.dataType = util.translate(property.dataType, this.primativeToObjectMap);
      property.optionalDataType = property.dataType;
      
      if (property.dataType == 'Integer') {
        this.addImport('java.util.OptionalInt', model);
        this.addImport('java.util.OptionalInt', property);
        property.dataType = 'OptionalInt';
        property.empty = 'OptionalInt.empty()';
        property.assign = property.name + ' != null ? OptionalInt.of(' + property.name + ') : OptionalInt.empty()';
      } else if (property.dataType == 'Long') {
        this.addImport('java.util.OptionalLong', model);
        this.addImport('java.util.OptionalLong', property);
        property.dataType = 'OptionalLong';
        property.empty = 'OptionalLong.empty()';
        property.assign = property.name + ' != null ? OptionalLong.of(' + property.name + ') : OptionalLong.empty()';
      } else if (property.dataType == 'Double') {
        this.addImport('java.util.OptionalDouble', model);
        this.addImport('java.util.OptionalDouble', property);
        property.dataType = 'OptionalDouble';
        property.empty = 'OptionalDouble.empty()';
        property.assign = property.name + ' != null ? OptionalDouble.of(' + property.name + ') : OptionalDouble.empty()';
      } else {
        this.addImport('java.util.Optional', model);
        this.addImport('java.util.Optional', property);
        property.dataType = 'Optional<' + property.dataType + '>';
        property.empty = 'Optional.empty()';
        property.assign = 'Optional.ofNullable(' + property.name + ')';
      }
    }
  });
};