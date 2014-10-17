var Template = require('..');
var template = new Template();


/**
 * This example shows how to create a new template type, `includes`.
 *
 * This template type will allow you to load partials/includes the way
 * you would expect, so that any loaded templates can be used in other
 * templates as _includes_.
 *
 * Also note the callback function, this is a middleware that will be
 * executed every time a template is loaded using the `.include()` and
 * `.includes()` methods.
 */

template.create('include', { isPartial: true, isLayout: true }, function (value, key, next) {
  console.log(arguments);
  next(null, value, key);
});


/**
 * Example usage
 */

template.include('block', {content: '<bar>{% body %}</bar>'}); // useless example wrapper
template.include('alert', {content: '<baz class="alert">Heads up!</baz>', layout: 'block'});
template.include('sidebar', {content: '<nav>This is a lame sidebar!</nav>'});
// console.log(template.get('includes'));


template.page('home.md', {content: '<foo><%= include("alert") %></foo>'});
template.render('home.md', function (err, res) {
  console.log(res)
})
