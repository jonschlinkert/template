/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('lodash');
var delim = require('delims');


// Defaults passed to 'delim' lib
var defaults = {body: '', beginning: '', end: '', flags: 'g'};

// Process templates
var template = function(str, data, options) {
  // Clone the data
  data = _.extend({}, data);

  // Delimiter options
  var opts = _.extend({}, defaults, options);
  var settings = _.extend({}, {variable: opts.variable}, opts.settings || {});
  // Store a copy of the original string
  var original = str;

  // Look for templates to process until no more can be found
  if (opts.delims) {
    // Extend settings with custom delimiters
    settings = _.extend({}, settings, delim(opts.delims, opts));
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
  filepath = fs.readFileSync(filepath, 'utf8');
  return template(filepath, data, options);
};


module.exports = template;