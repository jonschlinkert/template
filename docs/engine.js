'use strict';

/**
 * Module dependencies.
 */

var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var _ = require('lodash');


module.exports = function (template) {
  return function (options) {
    var opts = _.extend({engine: 'hbs'}, template.options, options);

    return through.obj(function (file, encoding, cb) {
      if (file.isNull()) {
        this.push(file);
        return cb();
      }
      if (file.isStream()) {
        this.emit('error', new gutil.PluginError('gulp-engine', 'Streaming not supported'));
        return cb();
      }

      var o = {};
      var name = path.basename(file.path);
      o[name] = _.extend({}, file);
      o[name].content = file.contents.toString('utf8');
      o[name].path = name;

      template.page(o, opts);

      try {
        var stream = this;
        template.render(name, opts, function (err, content, ext) {

          if (err) {
            stream.emit('error', new gutil.PluginError('gulp-engine', err));
            cb(err);
          } else {

            file.contents = new Buffer(content);
            file.path = gutil.replaceExtension(file.path, opts.destExt || file.ext);
            stream.push(file);
            cb();
          }
        });

      } catch (err) {
        this.emit('error', new gutil.PluginError('gulp-engine', err));
        return cb();
      }
    });
  }
}