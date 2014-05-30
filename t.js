var fs = require('fs');
var _ = require('lodash');

// using the "interpolate" delimiter to create a compiled template
var compiled = _.template('hello <%= name %>');
compiled({
  name: 'fred'
});
// → 'hello fred'

// using the "escape" delimiter to escape HTML in data property values
_.template('<b><%- value %></b>', {
  value: '<script></script>'
});
// → '<b>&lt;script&gt;</b>'

// using the "evaluate" delimiter to generate HTML
var list = '<% _.forEach(people, function(name) { %><li><%- name %></li><% }); %>';
_.template(list, {
  people: ['fred', 'barney']
});
// → '<li>fred</li><li>barney</li>'

// using the ES6 delimiter as an alternative to the default "interpolate" delimiter
_.template('hello ${ name }', {
  name: 'pebbles'
});
// → 'hello pebbles'

// using the internal `print` function in "evaluate" delimiters
_.template('<% print("hello " + name); %>!', {
  name: 'barney'
});
// → 'hello barney!'


// using a custom template delimiters
_.templateSettings.interpolate = /\{{([\s\S]+?)}}/g;
_.template('hello {{ name }}!', {
  name: 'mustache'
});
// → 'hello mustache!'

// using the `imports` option to import jQuery
// var list = '<% jq.each(people, function(name) { %><li><%- name %></li><% }); %>';
// _.template(list, {
//   people: ['fred', 'barney']
// }, {
//   'imports': {
//     jq: jQuery
//   }
// });
// → '<li>fred</li><li>barney</li>'

// using the `sourceURL` option to specify a custom sourceURL for the template
var compiled = _.template('hello <%= name %>', null, {
  sourceURL: '/basic/greeting.jst'
});

compiled(data);
// → find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector

// using the `variable` option to ensure a with-statement isn't used in the compiled template
var compiled = _.template('hi <%= data.name %>!', null, {
  variable: 'data'
});

compiled.source;

// → function(data) {
// var __t, __p = '',
//   __e = _.escape;
// __p += 'hi ' + ((__t = (data.name)) == null ? '' : __t) + '!';
// return __p;
// }

// using the `source` property to inline compiled templates for meaningful
// line numbers in error messages and a stack trace
fs.writeFileSync(path.join(cwd, 'jst.js'), '\
  var JST = {\
    "main": ' + _.template(mainText).source + '\
  };\
');