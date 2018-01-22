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

var TemplateProcessor = require("../lib/templates");
var templateProcessor;

var testEngine = {
  name : 'test',
  extensions : ['.test'],
  compile : function(source, options) {
  }
};

beforeEach(function () {
  templateProcessor = new TemplateProcessor();
});

describe('init', function() {
  it('should automatically scan the internal template engines', function() {
    Object.keys(templateProcessor.templateEnginesByExt).length.should.not.equal(0);
    Object.keys(templateProcessor.templateEnginesByName).length.should.not.equal(0);
  });

  it('should automatically add the internal template directory', function() {
    templateProcessor.templateDirectories[0].should.equal(path.resolve(__dirname, '../templates'));
  });
});

describe('registerLibrary', function() {
  it('should register engines, engine directories, and template directories', function() {
    var library = {
      templateEngineDirs : [
        path.resolve(__dirname, 'helpers/template-engines')
      ],
      templateEngines : [
        testEngine
      ],
      templateDirs : [
        path.resolve(__dirname, 'helpers/templates')
      ],
    };
    
    var size = Object.keys(templateProcessor.templateEnginesByExt).length;
    templateProcessor.registerLibrary(library);
    Object.keys(templateProcessor.templateEnginesByExt).length.should.equal(size + 2);
    templateProcessor.templateDirectories.length.should.equal(2);
  });
});

describe('registerEngine', function() {
  it('should register a single template engine', function() {
    templateProcessor.registerEngine(testEngine);
    templateProcessor.templateEnginesByExt['.test'].should.equal(testEngine.compile);
    templateProcessor.templateEnginesByName['test'].should.equal(testEngine.compile);
  });
});

describe('registerEngineDirectory', function() {
  it('should register a directory of template engines', function() {
    var size = Object.keys(templateProcessor.templateEnginesByExt).length;
    templateProcessor.registerEngineDirectory(__dirname, 'helpers/template-engines');
    Object.keys(templateProcessor.templateEnginesByExt).length.should.equal(size + 1);
  });
});

describe('registerTemplateDirectory', function() {
  it('should add a path to its internal list of paths to search for templates', function() {
    templateProcessor.registerTemplateDirectory(__dirname, 'helpers/templates');
    templateProcessor.templateDirectories.length.should.equal(2);
    templateProcessor.templateDirectories[1].should.equal(path.resolve(__dirname, 'helpers/templates'));
  });
});

describe('compileFromSource', function() {
  it('should throw an error if a template engine cannot be found by name', function() {
    expect(function() {
      templateProcessor.compileFromSource('unknown', 'Hello, {name}!');
    }).to.throw("Could not find template engine for unknown");
  });

  it('should compile a template from a string and return a function to invoke', function() {
    templateProcessor.registerEngineDirectory(__dirname, 'helpers/template-engines');
    var template = templateProcessor.compileFromSource('text', 'Hello, {name}!');
    var actual = template({ name : 'World' });
    actual.should.equal('Hello, World!');
  });
});

describe('compileFromFile', function() {
  it('should find the appropriate template file by looking in the list of paths in reverse order', function() {
    var template, actual;
    var backup = templateProcessor.templateDirectories;

    templateProcessor.templateDirectories = [ path.resolve(__dirname, '../templates') ];
    template = templateProcessor.compileFromFile('html/index.handlebars');
    actual = template({ name : 'World' });
    actual.should.not.equal('Hello, World!');

    templateProcessor.templateDirectories = backup;
    template = templateProcessor.compileFromFile('html/index.handlebars');
    actual = template({ name : 'World' });
  });

  it('should throw an error if a template engine cannot be found by the file extension', function() {
    expect(function() {
      templateProcessor.compileFromFile('test.unknown');
    }).to.throw("Could not find template engine for file extension .unknown");
  });

  it('should throw an error if the template file cannot be found', function() {
    expect(function() {
      templateProcessor.compileFromFile('does_not_exist.handlebars');
    }).to.throw("Could not find template does_not_exist.handlebars");
  });

  it('should not try to load a directory', function() {
    expect(function() {
      templateProcessor.registerTemplateDirectory(__dirname, 'helpers/templates');
      templateProcessor.compileFromFile('i_am_a_directory.handlebars');
    }).to.throw("Could not find template i_am_a_directory.handlebars");
  });

  it('should compile a template from a file and return a function to invoke', function() {
    templateProcessor.registerEngineDirectory(__dirname, 'helpers/template-engines');
    templateProcessor.registerTemplateDirectory(__dirname, 'helpers/templates');
    var template = templateProcessor.compileFromFile('test.txt');
    var actual = template({ name : 'World' });
    actual.should.equal('Hello, World!');
  });
});