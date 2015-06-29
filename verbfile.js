'use strict';

/* deps: jshint-stylish mocha */
var path = require('path');
var istanbul = require('gulp-istanbul');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var gutil = require('gulp-util');
var verb = require('verb');

verb.option({templates: {docs: 'docs/_readme'}});

verb.helper('rename', function(str, a, b, c) {
  str = str.split(a + '.').join(b + '.');
  str = str.split('var ' + a).join('var ' + b);
  var upperB = b[0].toUpperCase() + b.slice(1);
  str = str.split(c).join(upperB);
  return str;
});

verb.helper('npm', function (name) {
  return 'node_modules/' + name + '/index.js';
});

verb.helper('home', function (name) {
  var dir = path.dirname(require.resolve(name));
  var pkg = path.resolve(dir, 'package.json');
  return require(pkg).homepage + '/blob/master/index.js';
});

verb.task('readme', function() {
  verb.src('.verb.md')
    .pipe(verb.dest('./'));
});

verb.task('docs', function() {
  verb.src('docs/_verb/temp/**/*.md')
    .pipe(verb.dest('docs/temp'));
});

verb.task('lint', function () {
  verb.src(['index.js', 'lib/**/*.js'])
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'));
});

verb.task('test', function (cb) {
  // deps: coveralls istanbul jshint-stylish
  verb.src(['index.js', 'lib/**/*.js'])
    .pipe(istanbul({includeUntested: true}))
    .pipe(istanbul.hookRequire())
    .on('finish', function () {
      verb.src(['test/*{,.*}.js'])
        .pipe(mocha())
        .pipe(istanbul.writeReports({
          reporters: [ 'text' ],
          reportOpts: {dir: 'coverage', file: 'summary.txt'}
        }))
        .on('end', function () {
          cb();
        });
    });
});

verb.task('default', ['readme', 'lint', 'test']);
