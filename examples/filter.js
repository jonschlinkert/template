'use strict';

var fs = require('fs');
var path = require('path');
var mm = require('micromatch');

function Filter(dirs) {
  var res = lookupEach(dirs);
  this.ctx = res;
  this.files = res.files || [];
  this.dirs = res.dirs || [];
  this.stash = [];
  this.cache = {};
}

Filter.prototype = {
  constructor: Filter,

  filter: function(glob, options) {
    this.stash.push(mm(this.files, glob, options));
    return this;
  },

  set: function(key, glob, options) {
    this.cache[key] = mm(this.ctx.files, glob, options);
    return this;
  },

  get: function(key) {
    var res = this.cache[key];
    res.__proto__ = this;
    return res;
  },

  use: function(fn) {
    this.ctx.files = fn.call(this.ctx, this.ctx.files);
    return this;
  },

  basename: function(key, glob) {
    this.cache[key] = mm(this.files, glob, { matchBase: true });
    return this;
  },

  dirname: function(key, glob) {
    this.cache[key] = mm(this.dirs, glob);
    return this;
  },

  reduce: function(fn) {
    // console.log(this)
    var res = reduce(this.files, fn.bind(this.ctx));
    this.ctx.files = res;
    res.__proto__ = this;
    return res;
  }
};


var files = new Filter(['test', 'lib', 'coverage', 'node_modules/utils']);

var foo = files
  .set('dot', '.*', {matchBase: true})
  .set('js', '*.js', {matchBase: true})
  .dirname('pick', '**/*pick')
  .dirname('object', '**/*obj*')
  .reduce(function (acc, file) {
    if (/layout|engine/.test(file)) {
      acc.push(file);
    }
    return acc;
  })
  .reduce(function (acc, file) {
    if (/layout/.test(file)) {
      acc.push(file);
    }
    return acc;
  })
  .use(function (files) {
console.log(files)
  })



function lookupEach(dirs) {
  dirs = arrayify(dirs);
  var len = dirs.length;
  var res = {files: [], dirs: []};
  while (len--) {
    var dir = lookup(dirs[len]);
    res.files = res.files.concat(dir.files);
    res.dirs = res.dirs.concat(dir.dirs);
  }
  return res;
}

function lookup(dir, res) {
  var files = fs.readdirSync(dir);
  var len = files.length, i = 0;
  res = res || {};

  res.files = res.files || [];
  res.dirs = res.dirs || [];

  while (len--) {
    var name = files[i++];
    var fp = path.join(dir, name);

    if (fs.statSync(fp).isDirectory()) {
      res.dirs.push(fp);
      lookup(fp, res);
    } else {
      res.files.push(fp);
    }
  }
  return res;
}


function arrayify(val) {
  return Array.isArray(val) ? val : [val];
}


function reduce(arr, cb) {
  var len = arr.length;
  var res = [];

  if (!len) return [];

  for (var i = 0; i < len; i++) {
    if (i === 0) {
      res = [arr[i]];
    } else {
      res = cb(res, arr[i], i, arr);
    }
  }
  return res || [];
}




