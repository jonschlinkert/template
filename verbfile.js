'use strict';

/* deps: jshint-stylish mocha */
var istanbul = require('gulp-istanbul');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var gutil = require('gulp-util');
var verb = require('verb');

verb.task('readme', function() {
  return verb.src('.verb.md')
    .pipe(verb.dest('./'));
});

verb.task('api', function() {
  return verb.src('docs/.verb/*.md')
    .pipe(verb.dest('docs'));
});

verb.task('lint', function () {
  return verb.src(['index.js', 'lib/**/*.js'])
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'));
});

verb.task('test', ['lint'], function (cb) {
  verb.src(['index.js', 'lib/**/*.js'])
    .pipe(istanbul({includeUntested: true}))
    .pipe(istanbul.hookRequire())
    .on('finish', function () {
      verb.src(['test/*.js'])
        .pipe(mocha())
        .on('error', gutil.log)
        .pipe(istanbul.writeReports())
        .on('end', function () {
          cb();
        });
    });
});

verb.task('default', ['readme', 'test']);
