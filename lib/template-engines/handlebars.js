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

var Handlebars = require("handlebars");
var _ = require("lodash");
var inflection = require('inflection');

Handlebars.registerHelper('translate', function(value, options) {
  if (options.hash[value]) {
    value = options.hash[value];
  }

  return new Handlebars.SafeString(value);
});

Handlebars.registerHelper('uppercase', function(value, options) {
  return value != null ? value.toUpperCase() : null;
});

Handlebars.registerHelper('lowercase', function(value, options) {
  return value != null ? value.toLowerCase() : null;
});

Handlebars.registerHelper('pluralize', function(value, options) {
  return value != null ? inflection.pluralize(value, options.hash.plural) : null;
});

Handlebars.registerHelper('singularize', function(value, options) {
  return value != null ? inflection.singularize(value, options.hash.singular) : null;
});

Handlebars.registerHelper('inflect', function(value, count, options) {
  return value != null ? inflection.inflect(value, count, options.hash.singular, options.hash.plural) : null;
});

Handlebars.registerHelper('camelize', function(value, options) {
  return value != null ? inflection.camelize(value, options.hash.low_first_letter) : null;
});

Handlebars.registerHelper('underscore', function(value, options) {
  return value != null ? inflection.underscore(value, options.hash.all_upper_case) : null;
});

Handlebars.registerHelper('humanize', function(value, options) {
  return value != null ? inflection.humanize(value, options.hash.low_first_letter) : null;
});

Handlebars.registerHelper('capitalize', function(value, options) {
  return value != null ? inflection.capitalize(value) : null;
});

Handlebars.registerHelper('dasherize', function(value, options) {
  return value != null ? inflection.dasherize(value) : null;
});

Handlebars.registerHelper('titleize', function(value, options) {
  return value != null ? inflection.titleize(value) : null;
});

Handlebars.registerHelper('demodulize', function(value, options) {
  return value != null ? inflection.demodulize(value) : null;
});

Handlebars.registerHelper('tableize', function(value, options) {
  return value != null ? inflection.tableize(value) : null;
});

Handlebars.registerHelper('classify', function(value, options) {
  return value != null ? inflection.classify(value) : null;
});

Handlebars.registerHelper('ordinalize', function(value, options) {
  return value != null ? inflection.ordinalize(value) : null;
});

Handlebars.registerHelper('transform', function(value, methods, options) {
  methods = _.map(methods.split(','), function(i) { return i.trim(); });
  return value != null ? inflection.transform(value, methods) : null;
});

function wordwrap(str, int_width, str_break, cut) {
  var m = int_width || 80;
  var b = str_break || '\n';
  var c = cut || false;

  var i, j, l, s, r;

  str += '';

  if (m < 1) {
    return str;
  }

  for (i = -1, l = (r = str.split(/\r\n|\n|\r/)).length; ++i < l; r[i] += s) {
    for (s = r[i], r[i] = ''; s.length > m; r[i] += s.slice(0, j) + ((s = s.slice(j)).length ? b : '')) {
      j = c == 2 || (j = s.slice(0, m + 1).match(/\S*(\s)?$/))[1]
        ? m
        : j.input.length - j[0].length || c == 1 && m || j.input.length + (j = s.slice(m).match(/^\S*/))[0].length;
    }
  }

  return r.join('\n');
}

Handlebars.registerHelper('commentize', function(comment, prefix, options) {
  comment = wordwrap(comment.trim(), options.hash.width, options.hash.break, options.hash.cut);
  var lines = comment.split('\n');
  lines = _.map(lines, function(line) {
    return prefix + line.trim();
  })

  return new Handlebars.SafeString(lines.join('\n'));
});

Handlebars.registerHelper('pad', function(value, width) {
  while (value.length < width) {
    value += ' ';
  }

  return new Handlebars.SafeString(value);
});

function compile(source, options) {
  options = options || {};
  options.noEscape = options.noEscape || false;
  return Handlebars.compile(source, options);
}

module.exports.name = 'handlebars';
module.exports.extensions = ['.handlebars', '.hbs'];
module.exports.compile = compile;