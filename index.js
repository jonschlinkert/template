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

var template = module.exports = {};

// Escape custom template delimiters
var escapeDelim = function(re) {
  return re.replace(/(.)/g, '\\$1');
};

template.setDelimiters = function (delims, expression) {
  // Generate RegExp patterns dynamically.
  var open = escapeDelim(delims[0]);
  expression = expression || '([\\s\\S]+?)';
  var close = escapeDelim(delims[1]);
  return {
    evaluate: new RegExp(open + expression + close, 'g'),
    interpolate: new RegExp(open + '=' + expression + close, 'g'),
    escape: new RegExp(open + '-' + expression + close, 'g')
  };
};

// Process templates
template.process = function(content, options) {
  var defaults = {process: true, data: {}};
  var opts = _.extend(defaults, options);
  var settings = _.extend({variable: opts.namespace || ''});

  var last = content;
  if(opts.delims) {
    var delims = template.setDelimiters(opts.delims);
    settings = _.extend(settings, delims);
    while (content.indexOf(opts.delims[1]) >= 0) {
      content = _.template(content, opts.data, settings);
      if (content === last) { break; }
      last = content;
    }
  } else {
    while (content.indexOf('${') >= 0 || content.indexOf('%>') >= 0) {
      content = _.template(content, opts.data, settings);
      if (content === last) { break; }
      last = content;
    }
  }
  return content;
};

// Copy files synchronously and process any templates within
template.copy = function (src, dest, options) {
  var defaults = {delims: ['{%', '%}'], process: true, data: {}};
  var opts = _.extend(defaults, options);

  src = file.readFileSync(src);
  if(opts.process === true) {
    src = template.process(src, opts);
  }
  file.writeFileSync(dest, src, opts);
};