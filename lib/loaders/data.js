'use strict';

var fs = require('fs');
var path = require('path');
var globby = require('lazy-globby');

/**
 * Data loaders
 */

module.exports = function (app) {
  app.loader('glob', globby().sync.bind(globby));

  app.loader('data', ['glob'], function (files) {
    return files.reduce(function (acc, fp) {
      var data = JSON.parse(fs.readFileSync(fp, 'utf8'));
      var name = path.basename(fp, path.extname(fp));
      if (name === 'data') {
        app.visit('data', data);
      } else {
        acc[name] = data;
      }
      return acc;
    }, app.cache.data);
  });
};
