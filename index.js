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

// Process templates
var template = function(content, data, options) {
  data = Object.create(data || {});

  // Delimiter options
  var defaults = {body: '', beginning: '', end: '', flags: 'g'};
  var opts = _.extend({}, defaults, options);

  // Template settings
  var settings = _.extend({variable: opts.namespace || ''}, opts.settings);

  // Store the original content
  var original = content;

  // Process templates recursively until no more templates are found
  if(opts.delims) {
    settings = _.extend(settings, delim(opts.delims, opts));
    while (content.indexOf(opts.delims[0]) >= 0) {
      content = _.template(content, data, settings);
      if (content === original) { break; }
    }
  } else {
    // If no custom delimiters are provided, use the defaults.
    while (content.indexOf('${') >= 0 || content.indexOf('%>') >= 0) {
      content = _.template(content, data, settings);
      if (content === original) { break; }
    }
  }
  return content;
};


// Read files and process any templates therein
template.process = function(src, data, options) {
  var content = file.readFileSync(src);
  return template(content, data, options);
};


// Copy files and process any templates therein
template.copy = function (src, dest, options) {
  var opts = _.extend({}, {process: true}, options || {});
  src = file.readFileSync(src);
  if(opts.process === true) {
    src = template(src, opts.data, opts);
  }
  file.writeFileSync(dest, src, opts);
};

module.exports = template;