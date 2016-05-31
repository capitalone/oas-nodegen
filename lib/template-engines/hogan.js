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

var hogan = require('hogan.js');

function compile(source, options) {
  var tmpl = hogan.compile(source, options);

  return function(data) {
    return tmpl.render(data);
  };
}

module.exports.name = 'hogan';
module.exports.extensions = ['.mustache', '.hogan'];
module.exports.compile = compile;