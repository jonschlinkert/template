'use strict';

var istanbul = require('gulp-istanbul');
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

verb.task('test', function (cb) {
  verb.src('lib/**/*.js')
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
    .on('finish', function () {
      verb.src('test/*.js')
        .pipe(mocha())
        .pipe(istanbul.writeReports())
        .on('end', cb);
    });
});

verb.task('default', ['readme', 'api']);
