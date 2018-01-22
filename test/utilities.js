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

var common = require("./common");
var options = common.options;
var assert = common.assert;
var expect = common.expect;
var should = common.should;
var _ = require('lodash');

var util = require("../lib/utilities");

it('getSuccessResponse', function() {
  expect(util.getSuccessResponse({ })).to.equal(null);
  expect(util.getSuccessResponse({ responses : { } })).to.equal(null);
  expect(util.getSuccessResponse({ responses : { '200' : 'test' } })).to.equal('test');
  expect(util.getSuccessResponse({ responses : { '201' : 'test' } })).to.equal('test');
});

it('translate', function() {
  expect(util.translate('test', {})).to.equal('test');
  expect(util.translate('test', {}, 'default')).to.equal('default');
  expect(util.translate('test', { 'test' : 'match' })).to.equal('match');
  expect(util.translate('test', { 'test' : 'match' }, 'default')).to.equal('match');
});

it('resolveReference', function() {
  var resolved;
  var obj = {};
  var embedded = { name : 'embedded' };
  var spec = {
    definitions : {
      Test : embedded
    }
  };

  var test1 = { name : 'test1' };
  var ref1 = { Test : test1 };
  var test2 = { name : 'test2' };
  var ref2 = { Test : test2 };

  var references = {
    top: {
      ref1 : ref1
    },
    sub: {
      ref2 : ref2
    }
  };

  resolved = util.resolveReference(obj, spec, references);
  expect(resolved.obj).to.equal(obj);
  expect(resolved.spec).to.equal(spec);
  expect(resolved.same).to.equal(true);

  obj = { $ref : 'ref1#/Test' };
  resolved = util.resolveReference(obj, spec, references);
  expect(resolved.obj).to.equal(test1);
  expect(resolved.spec).to.equal(ref1);
  expect(resolved.same).to.equal(false);

  obj = { $ref : '#/definitions/Test' };
  resolved = util.resolveReference(obj, spec, references);
  expect(resolved.obj).to.equal(embedded);
  expect(resolved.spec).to.equal(spec);
  expect(resolved.same).to.equal(false);

  obj = { $ref : '#/definitions/does/not/Exist' };
  resolved = util.resolveReference(obj, spec, references);
  expect(resolved.obj).to.equal(undefined);
  expect(resolved.spec).to.equal(spec);
  expect(resolved.same).to.equal(false);

  obj = { $ref : 'ref1' };
  resolved = util.resolveReference(obj, spec, references);
  expect(resolved.obj).to.equal(ref1);
  expect(resolved.spec).to.equal(ref1);
  expect(resolved.same).to.equal(false);

  expect(function() {
    obj = { $ref : 'abc#/Test' };
    util.resolveReference(obj, spec, references);
  }).to.throw('Could not find reference for abc');
});

it('getReferenceName', function() {
  expect(util.getReferenceName('Test')).to.equal('Test');
  expect(util.getReferenceName('#Test')).to.equal('Test');
  expect(util.getReferenceName('#definitions/Test')).to.equal('Test');
});

it('extractModelName', function() {
  expect(util.extractModelName('Test')).to.equal('Test');
  expect(util.extractModelName('#Test')).to.equal('Test');
  expect(util.extractModelName('#definitions/Test')).to.equal('Test');
  expect(util.extractModelName('#definitions/Test.Other')).to.equal('Test');
});

it('getMimeType', function() {
  expect(util.getMimeType(null)).to.equal('application/json');
  expect(util.getMimeType([])).to.equal('application/json');
  expect(util.getMimeType(['application/json', 'text/xml'])).to.equal('application/json');
  expect(util.getMimeType(['text/xml', 'application/json'])).to.equal('application/json');
  expect(util.getMimeType(['text/xml', 'application/pdf'])).to.equal('text/xml');
});

it('sortKeys', function() {
  var sorted = util.sortKeys({ z : 1, Y : 2, x : 3 });
  var keys = _.keys(sorted);
  keys[0].should.equal('x');
  keys[1].should.equal('Y');
  keys[2].should.equal('z');
});

it('capitalize', function() {
  expect(util.capitalize(null)).to.equal(null);
  expect(util.capitalize('a')).to.equal('A');
  expect(util.capitalize('test')).to.equal('Test');
});

it('uncapitalize', function() {
  expect(util.uncapitalize(null)).to.equal(null);
  expect(util.uncapitalize('A')).to.equal('a');
  expect(util.uncapitalize('Test')).to.equal('test');
});

it('random', function() {
  var random = util.random(-100, 100);
  expect(random).to.be.at.least(-100).and.at.most(100);
});