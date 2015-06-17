'use strict';

var fs = require('fs');
var path = require('path');
var glob = require('lazy-globby');

module.exports = function (app) {
  // sync loaders
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


// var flatten = require('arr-flatten');
// var isObject = require('isobject');
// var LoaderCache = require('loader-cache');
// var iterators = require('./iterators');
// var loaders = require('./loaders/last');

// function Loaders(options, stack) {
//   if (!isObject(options)) {
//     stack = options;
//     options = {};
//   }
//   defineGetter(this, 'iterators', {});
//   defineGetter(this, 'loaders', stack || {});
//   defineGetter(this, 'options', options || {});
//   this.init();
// }

// Loaders.prototype.init = function(fn) {
//   // last loaders
//   this.loader('last', { loaderType: 'async' }, loaders(this).async);
//   this.loader('last', { loaderType: 'promise' }, loaders(this).promise);
//   this.loader('last', { loaderType: 'stream' }, loaders(this).stream);
//   this.loader('last', { loaderType: 'sync' }, loaders(this).sync);

//   // iterator types
//   this.iterator('async', iterators.async);
//   this.iterator('promise', iterators.promise);
//   this.iterator('stream', iterators.stream);
//   this.iterator('sync', iterators.sync);
// };

// Loaders.prototype.load = function (args, opts, stack) {
//   var load = loader.compose(loaders.stack);
//   var res = load.apply(this, args);
//   if (type !== 'stream') return res;
//   res.on('error', function (err) {
//     console.log('Loaders#loadStream: .%s, %j, %j', err, args);
//   });
//   return res;
// };
