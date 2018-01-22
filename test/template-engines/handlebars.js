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
var path = common.path;

var handlebars = require("../../lib/template-engines/handlebars");

describe('engine', function() {
  it('should be named correctly', function() {
    handlebars.name.should.equal('handlebars');
  });

  it('should handle .handlebar and .hbs files', function() {
    handlebars.extensions.indexOf('.handlebars').should.not.equal(-1);
    handlebars.extensions.indexOf('.hbs').should.not.equal(-1);
  });

  it('should compile templates', function() {
    var template = handlebars.compile("Hello, {{name}}!");
    template({ name : 'World' }).should.equal("Hello, World!");
  });
});

describe('helpers', function() {
  it('should generate comment block content', function() {
    var template = handlebars.compile('{{commentize "test test test" "* "}}');
    template({}).should.equal('* test test test');
    template = handlebars.compile('{{commentize "test test test" "* " width=5}}');
    template({}).should.equal('* test\n* test\n* test');
    template = handlebars.compile('{{commentize "test test test" "* " width=-1}}');
    template({}).should.equal('* test test test');
  });

  it('should translate strings for known values', function() {
    var template = handlebars.compile('{{translate "none" test="1234"}}');
    template({}).should.equal('none');
    var template = handlebars.compile('{{translate "test" test="1234"}}');
    template({}).should.equal('1234');
  });

  it('should uppercase & lowercase values', function() {
    var template = handlebars.compile('{{uppercase value}}');
    template({ value : 'test' }).should.equal('TEST');
    template({ value : null }).should.equal('');
    var template = handlebars.compile('{{lowercase value}}');
    template({ value : 'TEST' }).should.equal('test');
    template({ value : null }).should.equal('');
  });

  it('should pluralize values', function() {
    var template = handlebars.compile('{{pluralize value}}');
    template({ value : null }).should.equal('');
    template({ value : 'person' }).should.equal('people');
    template({ value : 'octopus' }).should.equal('octopi');
    template({ value : 'Hat' }).should.equal('Hats');
    template = handlebars.compile('{{pluralize value plural="guys"}}');
    template({ value : 'person' }).should.equal('guys');
  });

  it('should singularize values', function() {
    var template = handlebars.compile('{{singularize value}}');
    template({ value : null }).should.equal('');
    template({ value : 'people' }).should.equal('person');
    template({ value : 'octopi' }).should.equal('octopus');
    template({ value : 'Hats' }).should.equal('Hat');
    template = handlebars.compile('{{singularize value singular="person"}}');
    template({ value : 'guys' }).should.equal('person');
  });

  it('should inflect values', function() {
    var template = handlebars.compile('{{inflect value count}}');
    template({ value : null }).should.equal('');
    template({ value : 'people', count: 1 }).should.equal('person');
    template({ value : 'octopi', count: 1 }).should.equal('octopus');
    template({ value : 'Hats', count: 1 }).should.equal('Hat');
    template = handlebars.compile('{{inflect value count singular="person"}}');
    template({ value : 'guys', count: 1 }).should.equal('person');
    template = handlebars.compile('{{inflect value count}}');
    template({ value : 'person', count: 2 }).should.equal('people');
    template({ value : 'octopus', count: 2 }).should.equal('octopi');
    template({ value : 'Hat', count: 2 }).should.equal('Hats');
    template = handlebars.compile('{{inflect value count plural="guys"}}');
    template({ value : 'person', count: 2 }).should.equal('guys');
  });

  it('should camelize values', function() {
    var template = handlebars.compile('{{camelize value}}');
    template({ value : null }).should.equal('');
    template({ value : 'message_properties' }).should.equal('MessageProperties');
    template = handlebars.compile('{{camelize value low_first_letter=true}}');
    template({ value : 'message_properties' }).should.equal('messageProperties');
  });

  it('should underscore values', function() {
    var template = handlebars.compile('{{underscore value}}');
    template({ value : null }).should.equal('');
    template({ value : 'MessageProperties' }).should.equal('message_properties');
    template({ value : 'messageProperties' }).should.equal('message_properties');
    template({ value : 'MP' }).should.equal('m_p');
    template = handlebars.compile('{{underscore value all_upper_case=true}}');
    template({ value : 'MP' }).should.equal('MP');
  });

  it('should humanize values', function() {
    var template = handlebars.compile('{{humanize value}}');
    template({ value : null }).should.equal('');
    template({ value : 'message_properties' }).should.equal('Message properties');
    template = handlebars.compile('{{humanize value low_first_letter=true}}');
    template({ value : 'message_properties' }).should.equal('message properties');
  });

  it('should capitalize values', function() {
    var template = handlebars.compile('{{capitalize value}}');
    template({ value : null }).should.equal('');
    template({ value : 'message_properties' }).should.equal('Message_properties');
  });

  it('should dasherize values', function() {
    var template = handlebars.compile('{{dasherize value}}');
    template({ value : null }).should.equal('');
    template({ value : 'message_properties' }).should.equal('message-properties');
    template({ value : 'Message properties' }).should.equal('Message-properties');
  });

  it('should titleize values', function() {
    var template = handlebars.compile('{{titleize value}}');
    template({ value : null }).should.equal('');
    template({ value : 'message_properties' }).should.equal('Message Properties');
    template({ value : 'message properties to keep' }).should.equal('Message Properties to Keep');
  });

  it('should demodulize values', function() {
    var template = handlebars.compile('{{demodulize value}}');
    template({ value : null }).should.equal('');
    template({ value : 'Message::Bus::Properties' }).should.equal('Properties');
  });

  it('should tableize values', function() {
    var template = handlebars.compile('{{tableize value}}');
    template({ value : null }).should.equal('');
    template({ value : 'MessageBusProperty' }).should.equal('message_bus_properties');
  });

  it('should classify values', function() {
    var template = handlebars.compile('{{classify value}}');
    template({ value : null }).should.equal('');
    template({ value : 'message_bus_properties' }).should.equal('MessageBusProperty');
  });

  it('should ordinalize values', function() {
    var template = handlebars.compile('{{ordinalize value}}');
    template({ value : null }).should.equal('');
    template({ value : 'the 1 pitch' }).should.equal('the 1st pitch');
  });

  it('should transform values', function() {
    var template = handlebars.compile('{{transform value "pluralize,capitalize,dasherize"}}');
    template({ value : null }).should.equal('');
    template({ value : 'all job' }).should.equal('All-jobs');
  });
});