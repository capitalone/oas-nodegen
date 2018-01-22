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
var path = common.path;
var fs = require("fs");

var Writer = require("../lib/writer");

var writer = new Writer(__dirname, 'target');

function tryMkdirSync(path) {
  try {
    fs.mkdirSync(path);
  } catch (err) {
  }
}

function tryExists(path) {
  try {
    var stat = fs.statSync(path);
    return stat.isDirectory() || stat.isFile();
  } catch (err) {
    return false;
  }
}

describe('clean', function() {
  it('recursively delete directories and files except for one explicitly prevented', function() {
    writer.preventDeletionOf('dontdeleteme.txt');
    writer.preventDeletionOf(/keepme\.[\w]+/);
    var target = path.resolve(__dirname, 'target');
    var sub1 = path.resolve(target, 'sub1');
    tryMkdirSync(sub1);
    var sub2 = path.resolve(sub1, 'sub2');
    tryMkdirSync(sub2);
    writer.clean();

    tryExists(sub2).should.equal(false);
    tryExists(sub1).should.equal(false);
    tryExists(path.resolve(target, 'dontdeleteme.txt')).should.equal(true);
  });

  it('will not fail when passed a directory that does not exist', function() {
    var writer = new Writer(__dirname, 'does_not_exist');
    writer.clean();
  });
});

describe('write', function() {
  it('recursively create directories in order to create a file', function() {
    var expected = 'Hello, World!';
    writer.write('one', 'two', 'hello.txt', expected);
    var actual = fs.readFileSync(path.resolve(__dirname, 'target/one/two/hello.txt'), 'utf8');
    actual.should.equal(expected);
    writer.clean();
  });

  it('optionally allow leading and trailing file comments', function() {
    var expected = 'Hello, World!';
    writer.setLeadingFileComments('[');
    writer.setTrailingFileComments(']');
    writer.write('one', 'two', 'headAndTail.txt', expected);
    var actual = fs.readFileSync(path.resolve(__dirname, 'target/one/two/headAndTail.txt'), 'utf8');
    actual.should.equal('[' + expected + ']');
    writer.clean();
  });
});