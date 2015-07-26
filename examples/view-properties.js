var App = require('..');
var app = new App();

/**
 * Create a view collection: "pages"
 */
app.create('pages');

/**
 * Add pages
 */

app.page('a', {path: 'pages/a.md', content: 'aaa...', data: {foo: {bar: 'Nested!'}}});
app.page('b', {path: 'pages/b.md', content: 'bbb...'});
app.page('c', {path: 'pages/c.md', content: 'ccc...'});

/**
 * Get a page
 */

var pageA = app.pages.get('a');

/**
 * Get a property from the page
 */

var path = pageA.get('path');
// => 'pages/a.md';

/**
 * Get a nested property from the page
 */

var data = pageA.get('data.foo.bar');
//=> 'Nested!';


/**
 * Get content
 */

var pageB = app.pages.get('b').content;
//=> 'bbb...';
