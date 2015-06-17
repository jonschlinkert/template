'use strict';

var fs = require('fs');
var path = require('path');
var glob = require('lazy-globby');

module.exports = function (app) {
  app.loader('glob', function(pattern) {
    return glob().sync(pattern);
  });

  app.loader('read', function(files) {
    return files.reduce(function (acc, fp) {
      var str = fs.readFileSync(fp, 'utf8');
      var name = path.basename(fp);
      acc[name] = {path: fp, content: str};
      return acc;
    }, {});
  });
};
