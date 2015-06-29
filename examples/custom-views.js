'use strict';

var App = require('..');
var app = new App();
app.engine('*', require('engine-lodash'));

var Views = app.get('Views');
// save original `set` method to use later
var set = Views.prototype.set;

// new constructor that executes the `Views` constructor
function CustomViews () {
  Views.apply(this, arguments);
}

// inherit prototype methods from `Views`
require('util').inherits(CustomViews, Views);

// replace `set` method with custom `set` method
CustomViews.prototype.set = function(key, value) {
  if (typeof key === 'object') {
    return set.call(this, key.key, key);
  }
  return set.call(this, key, value);
};

// add custom `mapVisit` method
CustomViews.prototype.mapVisit = function (method, arr) {
  return arr.reduce(function (acc, obj) {
    return acc[method](obj);
  }, this);
};

// replace original `Views` constructor with `CustomViews` constructor
app.set('Views', CustomViews);

/**
 * Loader
 */
app.iterator('sync', require('iterator-sync'));
app.loader('transform', function (views, options) {
  return function (key, value) {
    value.key = key;
    return [value];
  };
});

app.loader('load', function (views, options) {
  return function (arr) {
    views.mapVisit('set', arr);
    return views;
  };
});

/**
 * Create
 */
app.create('page', ['transform', 'load']);

/**
 * Load
 */
app.pages('a', {path: 'a', content: 'aaa...'});
app.pages('b', {path: 'b', content: 'bbb...'});
app.pages('c', {path: 'c', content: 'ccc...'});
app.pages('d', {path: 'd', content: 'ddd...'})
  .use(function (views, options, loaders) {
    // console.log(arguments)
  })

var page = app.pages.get('d')
  .use(function (view) {
    console.log('view:', view)
  })
  .render(function (err, view) {
    console.log('view:', view)
  })

console.log();
console.log('page:', page);
console.log('------');

var a = app.pages.get('d').clone()
console.log('page:', a);
