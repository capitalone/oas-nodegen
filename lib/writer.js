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

var fs = require('node-fs');
var path = require('path');
var _ = require('lodash');

module.exports = Writer;

var preventDeletionGlobal = [/^\.git/, /^\.svn/];

/**
 * Constructor
 *
 * @param {string[]} pathParts
 */
function Writer() {
  this.baseDir = path.resolve.apply(null, arguments);
  this.preventDeletion = _.clone(preventDeletionGlobal);
  this.leadingFileComments = null;
  this.trailingFileComments = null;
}

/**
 * Sets the contents to write to the beginning of a file when `write` is called.
 * E.g. legal banner.
 *
 * @param {string} comments The leading file comments
 */
Writer.prototype.setLeadingFileComments = function(comments) {
  this.leadingFileComments = comments;

  return this; // Allow chaining
}

/**
 * Sets the contents to write to the end of a file when `write` is called.
 * E.g. legal footer
 *
 * @param {string} comments The trailing file comments
 */
Writer.prototype.setTrailingFileComments = function(comments) {
  this.trailingFileComments = comments;

  return this; // Allow chaining
}

/**
 * Adds items to the list of file and folder names to prevent deleting.
 *
 * @param {string[]} pathsToPrevent The paths to add to the internal prevention list
 */
Writer.prototype.preventDeletionOf = function() {
  _.each(arguments, _.bind(function(item) { this.preventDeletion.push(item) }, this));

  return this; // Allow chaining
}

/**
 * Recursively cleans the base directory
 */
Writer.prototype.clean = function() {
  deleteFolderRecursive(this.baseDir, this.preventDeletion);

  return this; // Allow chaining
}

/**
 * Writes the contents of a string to a path and file
 *
 * @param {string[]} path The path to write to
 * @param {string} filename The filename to create/replace
 * @param {string} content The file content
 */
Writer.prototype.write = function() {
  var parts = [this.baseDir];
  var args = _.flatten(arguments);

  for (var i=0; i<args.length-2; i++) {
    parts.push(args[i]);
  }

  var dirname = path.resolve.apply(null, parts);
  var filename = args[args.length - 2];
  var content = args[args.length - 1];

  if (this.leadingFileComments) {
    content = this.leadingFileComments + content;
  }

  if (this.trailingFileComments) {
    content = content + this.trailingFileComments;
  }

  fs.mkdirSync(dirname, parseInt('0770',8), true);

  fs.writeFileSync(path.resolve(dirname, filename), content);

  return this; // Allow chaining
}

/**
 * Recurisive function that handles deleting a folder structure
 * but conditionally leaving behind select list of directory and file names.
 *
 * @private
 * @param {string} path The path to delete/clean
 * @param {string[]} preventDeletion The list of file and directory names to
 *    prevent the deletion of
 */
function deleteFolderRecursive(path, preventDeletion) {
  var canRemove = true;

  if (fs.existsSync(path)) {
    var files = fs.readdirSync(path);

    files.forEach(function(file,index) {
      var curPath = path + "/" + file;

      for (var i=0; i<preventDeletion.length; i++) {
        var pattern = preventDeletion[i];

        if (pattern instanceof RegExp && pattern.test(file)) {
          canRemove = false;
          return;
        } else if (file == pattern) {
          canRemove = false;
          return;
        }
      }

      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        if (!deleteFolderRecursive(curPath, preventDeletion)) {
          canRemove = false;
        }
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });

    if (canRemove) fs.rmdirSync(path);
  }

  return canRemove;
}