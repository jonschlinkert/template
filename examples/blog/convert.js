'use strict';

var fs = require('fs');
var path = require('path');
var write = require('write');
var extMap = require('ext-map');
var convert = require('liquid-to-handlebars');
var copy = require('cp-file');
var App = require('../..');
var app = new App();

var opts = {
  loaderType: 'sync',
  renameKey: function (fp) {
    return fp;
  }
};

app.loader('readdir', opts, function (views, opts) {
  return function (start) {
    function lookup(dir) {
      var files = fs.readdirSync(dir);
      var len = files.length;
      while (len--) {
        var name = files[len];
        var fp = path.join(dir, name);

        if (fs.statSync(fp).isDirectory()) {
          lookup(fp);
        } else {
          var file = {ext: path.extname(fp), path: fp};
          if (file.ext === '.html') {
            file.content = fs.readFileSync(fp, 'utf8');
          } else {
            file.content = null;
          }
          views.set(fp, file);
        }
      }
    }
    lookup(start);
    return views;
  }
});

app.create('post', opts, ['readdir']);
app.posts.option('renameKey', function (fp) {
  return fp;
});

var src = { base: 'vendor/bootstrap/docs' };
var dest = { base: 'src/_docs' };

app.posts(src.base)
  .forOwn(function (file, key) {
    var base = file.path.slice(src.base.length + 1);
    var destpath = path.join(dest.base, base);

    if (file.ext === '.html') {
      destpath = destpath.replace(/\.html$/, '.hbs');
      console.log('converting...', destpath);
      write.sync(destpath, convert(file.content));
    } else {
      copy(file.path, destpath, function (err) {
        if (err) return console.error(err);
        console.log('copied...', destpath);
      });
    }
  });


