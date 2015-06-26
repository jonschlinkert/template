'use strict';

var extend = require('extend-shallow');
var App = require('..');
var app = new App();

/**
 * Create a collection
 */
app.create('page', {foo: 'bar'});


/**
 * Load some templates
 */
app.pages('test/fixtures/*.txt', { baz: 'quux' }, function (views, options) {
  console.log(options);
  // collection options => {foo: 'bar'}

  return function (pattern, opts) {
      console.log(opts);
      //=> load options => {baz: 'quux'}

      // extend the cwd from the first loader onto the collection options
      extend(options, opts);

      // to enable chaining, you **must** return the collection instance
      return views;
    };
  })
  .pages('test/fixtures/*.md', function (views, options) {
    console.log(options);
    // collection options => {foo: 'bar', baz: 'quux'}
  });


console.log(app.views.pages)
