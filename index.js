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

var template = module.exports = {};

// Defaults passed to 'delim'
var defaults = {body: '', beginning: '', end: '', flags: 'g'};

// Process templates
var template = function(text, data, options) {
  data = Object.create(data || {});

  // Delimiter options
  var opts = _.extend({}, defaults, options);
  var settings = {variable: opts.namespace || ''};
  var original = text;

  // Look for templates to process until no more can be found
  if (opts.delims) {
    settings = _.extend(settings, delim(opts.delims, opts));
    while (text.indexOf(opts.delims[0]) >= 0) {
      text = _.template(text, data, delim(opts.delims, opts));
      if (text === original) {break;}
    }
  } else {
    // If no custom delimiters are provided, use the defaults.
    while (text.indexOf('${') >= 0 || text.indexOf('%>') >= 0) {
      text = _.template(text, data, settings);
      if (text === original) {break;}
    }
  }
  return text;
};


// Read files and process any templates therein
template.read = function(text, data, options) {
  text = file.readFileSync(text);
  return template(text, data, options);
};


// Copy files and process any templates therein
template.copy = function (text, dest, data, options) {
  var opts = _.extend({}, {process: true}, options || {});
  text = file.readFileSync(text);
  if(opts.process === true) {
    text = template(text, data, opts);
  }
  file.writeFileSync(dest, text, opts);
};

module.exports = template;