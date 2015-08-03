'use strict';

var fs = require('fs');
var path = require('path');

/**
 * Data loaders. This is initialized in the `init` method,
 * and the loaders are called in the `app.data` method.
 */

module.exports = function (app) {
  app.loader('data', ['base-glob'], function (files) {
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
