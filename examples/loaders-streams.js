
var fs = require('fs');
var path = require('path');
var through = require('through2');
var glob = require('globby');
var File = require('vinyl');
var App = require('..');
var app = new App();

/**
 * streams
 */

var opts = { loaderType: 'stream' };

// loaders
app.loader('glob', opts, function(views, options) {
  return through.obj(function (pattern, enc, cb) {
    var stream = this;
    glob(pattern, function (err, files) {
      if (err) return cb(err);
      stream.push(files);
      return cb();
    });
  });
});

app.loader('toVinyl', opts, ['glob'], function (views, options) {
  return through.obj(function toVinyl(files, enc, cb) {
    var stream = this;
    files.forEach(function (fp) {
      var buffer = fs.readFileSync(fp);
      views.set(fp, {path: fp, content: buffer.toString()});
      stream.push(new File({path: fp, contents: buffer }));
    });
    return cb();
  });
});

// create a template collection
app.create('doc', { viewType: 'renderable', loaderType: 'stream' }, ['toVinyl']);


// load templates with the collection-loader we just created
// (you can even use gulp plugins :)
app.docs('test/fixtures/*.txt')
  .pipe(through.obj(function(file, enc, cb) {
    console.log(file);
    console.log(app.views.docs)
    this.push(file);
    return cb();
  }));
