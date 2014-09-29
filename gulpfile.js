var path = require('path');
var gulp = require('gulp');
var pretty = require('gulp-prettify');

var Template = require('./');
var template = new Template();
var engine = require('./docs/engine')(template);
// var pretty = require('./docs/pretty');

// var resolve = require('resolve-dep');

template.engine('hbs', require('engine-handlebars'), {
  destExt: '.html'
});


template.set('extensions', ['hbs', 'md']);
template.option('pretty', true);
template.option('assets', 'dist/assets');
template.option('rename', function (filepath) {
  return path.basename(filepath, path.extname(filepath));
});
template.option('parse', function (filepath) {
  return {
    foo: filepath,
    bar: 'bar'
  }
});


template.partials('test/fixtures/partials/*.hbs');
template.layouts('test/fixtures/layouts/*.hbs');

// template.layout('base.hbs', require('./test/fixtures/layouts/base'));
// template.layout('default.hbs', require('./test/fixtures/layouts/default'));

template.data({
  name: 'Engine!',
  what: 'test'
});

gulp.task('default', function() {
  gulp.src('test/fixtures/pages/*.hbs')
    .pipe(engine())
    .pipe(pretty({
      indent_handlebars: true,
      indent_inner_html: true,
      preserve_newlines: false,
      max_preserve_newlines: 1,
      brace_style: 'expand',
      indent_char: ' ',
      indent_size: 2,
    }))
    .pipe(gulp.dest('test/actual'))
});