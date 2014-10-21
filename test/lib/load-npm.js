
var lookup = require('lookup-path');
var path = require('path');
var fs = require('fs');

module.exports = function (filepath) {
  var found = lookup(filepath);
  var filename = path.basename(filepath);
  var ext = path.extname(found);
  if (ext[0] === '.') {
    ext = ext.substring(1);
  }
  var loaded = loaders[ext](filepath);
  switch (ext) {
    case 'js':
      return loaded(filepath);
      break;
    case 'css':
      var obj = {};
      obj[filename] = {
        path: filepath,
        content: loaded
      };
      return obj;
      break;
    case 'json':
      loaded[filename].path = loaded[filename].path || filepath;
      return loaded;
      break;
  }
}

var loaders = {
  js: function (filepath) {
    return require(filepath);
  },

  css: function (filepath) {
    var content = fs.readFileSync(filepath).toString();
    return content;
  },

  json: function (filepath) {
    var content = fs.readFileSync(filepath).toString();
    try {
      return JSON.parse(content);
    } catch (err) {
      return {};
    }
  }
};