var gulp = require('gulp');
var pretty = require('gulp-prettify');

var Template = require('./');
var template = new Template();
var engine = require('./docs/engine')(template);
// var resolve = require('resolve-dep');


template.engine('hbs', require('engine-handlebars'), {
  destExt: '.html'
});

// template.set('assets', 'dist/assets');
template.partials('test/**/*.hbs');

template.data({
  name: 'Engine!',
  what: 'test'
});

gulp.task('default', function() {
  gulp.src('tmp/*.hbs')
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
    .pipe(gulp.dest('dist'))
});