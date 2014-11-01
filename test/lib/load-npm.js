'use strict';

var lookup = require('lookup-path');
var path = require('path');
var fs = require('fs');

module.exports = function (fp) {
  var found = lookup(fp);
  var filename = path.basename(fp);
  var ext = path.extname(found);
  if (ext[0] === '.') {
    ext = ext.substring(1);
  }
  var loaded = loaders[ext](fp);
  switch (ext) {
    case 'js':
      return loaded(fp);
      break;
    case 'css':
      var obj = {};
      obj[filename] = {path: fp, content: loaded};
      return obj;
      break;
    case 'json':
      loaded[filename].path = loaded[filename].path || fp;
      return loaded;
      break;
  }
};

var loaders = {
  js: function (fp) {
    return require(fp);
  },
  css: function (fp) {
    return fs.readFileSync(fp, 'utf8');
  },
  json: function (fp) {
    try {
      var content = fs.readFileSync(fp, 'utf8');
      return JSON.parse(content);
    } catch (err) {
      return {};
    }
  }
};