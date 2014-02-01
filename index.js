/*
 * template
 * https://github.com/jonschlinkert/template
 *
 * Copyright (c) 2014 Jon Schlinkert
 * Licensed under the MIT license.
 */

'use strict';

// node_modules
var _ = require('lodash');
var file = require('fs-utils');
var delim = require('delims');

// Mix in the methods from underscore string
_.str = require('underscore.string');


// Defaults passed to 'delim' lib
var defaults = {body: '', beginning: '', end: '', flags: 'g'};

// Process templates
var template = function(str, data, options) {
  data = _.extend({}, data);

  // Delimiter options
  var opts = _.defaults({}, options, defaults);

  // Mixin non-conflict methods to `_` namespace
  if(opts.nonconflict && opts.nonconflict === true) {
    _.mixin(_.str.exports());
  }

  var settings = _.extend({variable: opts.variable}, opts.settings);
  var original = str;

  // Look for templates to process until no more can be found
  if (opts.delims) {
    // Extend settings with custom delimiters
    settings = _.extend(settings, delim(opts.delims, opts));
    // Inspired by grunt.template
    while (str.indexOf(opts.delims[0]) >= 0) {
      str = _.template(str, data, settings);
      if (str === original) {break;}
    }
  } else {
    // If no custom delimiters are provided, use the defaults.
    while (str.indexOf('${') >= 0 || str.indexOf('%>') >= 0) {
      str = _.template(str, data, settings);
      if (str === original) {break;}
    }
  }
  return str;
};


// Read files and process any templates therein
template.read = function(filepath, data, options) {
  filepath = file.readFileSync(filepath);
  return template(filepath, data, options);
};

// Copy files and process any templates therein
template.copy = function (filepath, dest, data, options) {
  var opts = _.extend({}, {process: true}, options || {});
  filepath = file.readFileSync(filepath);
  if(opts.process === true) {
    filepath = template(filepath, data, opts);
  }
  file.writeFileSync(dest, filepath, opts);
};

module.exports = template;