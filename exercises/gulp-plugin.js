'use strict';

/**
 * Module dependencies.
 */

var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');

/**
 * The plugin
 */

// Wrap the plugin so we can ensure that we're using the same
// instance of `Engine` in the plugin and in the gulpfile.
module.exports = function (engine) {

  // Register a new template type. This is optional.
  engine.create('file', 'files', { isRenderable: true });

  return function (options) {
    return through.obj(function (file, encoding, cb) {
      if (file.isNull()) {
        this.push(file);
        return cb();
      }
      if (file.isStream()) {
        this.emit('error', new gutil.PluginError('gulp-engine', 'Streaming not supported'));
        return cb();
      }

      // Load and cache the template. This parses front-matter and normalizes the template object.
      engine.file(file);

      // The template is automatically cached with the basename of the file, so use this to
      // get the template.
      var name = path.basename(file);

      try {
        var stream = this;
        engine.render(name, options, function (err, content, ext) {
          if (err) {
            stream.emit('error', new gutil.PluginError('gulp-engine', err));
            cb(err);
          } else {

            file.contents = new Buffer(content);
            file.path = gutil.replaceExtension(file.path, '.html');
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
};