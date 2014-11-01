'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function (fp) {
  var filename = path.basename(fp);
  var ext = path.extname(fp);
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