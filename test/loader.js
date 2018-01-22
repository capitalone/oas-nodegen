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
var path = require('path');

var Loader = require("../lib/loader");
var loader;

beforeEach(function () {
  loader = new Loader();
});

var sampleURL = 'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v2.0/yaml/petstore-separate/spec/swagger.yaml';
var sampleYaml = path.resolve(__dirname, 'examples/yaml/petstore-separate/spec/swagger.yaml');
var sampleJson = path.resolve(__dirname, 'examples/json/petstore-expanded.json');
var invalidFile = path.resolve(__dirname, 'examples/yaml/invalid/spec/swagger.yaml');

describe('load', function() {
  it('should verify a spec was loaded', function(done) {
    loader.load(invalidFile).then(function(swagger) {
      done(new Error('This should not be valid'));
    }, function(err) {
      done();
    });
  });

  it('should be able to read specifications with references from a local file', function(done) {
    loader.load(sampleYaml).then(function(swagger) {
      try {
        swagger.swagger.should.equal("2.0");
        swagger.paths['/pets'].get.parameters[0].$ref
          .should.equal(path.resolve(__dirname, 'examples/yaml/petstore-separate/spec/parameters.yaml#/tagsParam'));
        Object.keys(swagger.$references.top).length.should.equal(1);
        Object.keys(swagger.$references.sub).length.should.equal(4);
        done(); 
      } catch (e) {
        done(e);
      }
    }, function(err) {
      done(err);
    });
  });

  it('should be able to read specifications with references from a URL', function(done) {
    this.timeout(10000);
    loader.load(sampleURL).then(function(swagger) {
      try {
        swagger.swagger.should.equal("2.0");
        done();
      } catch (e) {
        done(e);
      }
    }, function(err) {
      done(err);
    });
  });

  it('should also be able to read JSON formated specs', function() {
    loader.load(sampleJson).then(function(swagger) {
      try {
        swagger.swagger.should.equal("2.0");
        done();
      } catch (e) {
        done(e);
      }
    }, function(err) {
      done(err);
    });
  });
});