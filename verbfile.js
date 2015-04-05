'use strict';

var istanbul = require('gulp-istanbul');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var verb = require('verb');

verb.task('readme', function() {
  verb.src('.verb.md')
    .pipe(verb.dest('./'));
});

verb.task('api', function() {
  verb.src('docs/.verb/*.md')
    .pipe(verb.dest('docs'));
});

verb.task('lint', function () {
  verb.src(['index.js', 'lib/**/*.js'])
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'));
});

verb.task('test', ['lint'], function (cb) {
  verb.src(['index.js', 'lib/**/*.js'])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
    .on('finish', function () {
      verb.src('test/*.js')
        .pipe(mocha())
        .pipe(istanbul.writeReports())
        .on('end', cb);
    });
});

verb.task('default', ['test', 'readme', 'api']);
