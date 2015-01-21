
'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('browserify', function () {
  var bundler = browserify('./index.js', { debug: true })
    .require('./index.js', { expose: 'template' })
    .exclude('coffee-script')
    .exclude('toml')

  var bundle = function () {
    return bundler
      .bundle()
      .pipe(source('template.min.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      // .pipe(uglify())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist/'));
  };

  return bundle();
});

gulp.task('default', ['browserify']);
