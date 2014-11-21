'use strict';

var verb = require('verb');

verb.task('readme', function() {
  verb.src('.verb.md')
    .pipe(verb.dest('./'));
});

verb.task('api', function() {
  verb.src('docs/.verb/*.md')
    .pipe(verb.dest('docs'));
});

verb.task('default', ['readme', 'api']);
