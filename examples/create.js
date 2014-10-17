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
 * executed every time a template is loaded using the `.doc()` and
 * `.docs()` methods.
 */

template.create('include', function (value, key, next) {
  // do stuff
  next();
});


/**
 * Example usage
 */


template.include('sidebar', {content: '<nav>This is a lame sidebar!</nav>'});
console.log(template.get('includes'))