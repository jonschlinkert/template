# template [![NPM version](https://badge.fury.io/js/template.svg)](http://badge.fury.io/js/template)  [![Build Status](https://travis-ci.org/jonschlinkert/template.svg)](https://travis-ci.org/jonschlinkert/template)  [![Coverage Status](https://img.shields.io/coveralls/jonschlinkert/template.svg)](https://coveralls.io/r/jonschlinkert/template)

> Render templates using any engine. Supports, layouts, pages, partials and custom template types. Use template helpers, middleware, routes, loaders, and lots more. Powers assemble, verb and other node.js apps.

## Introduction

Here is a brief example of what you can do with Template.

```js
var app = require('template')();
app.engine('tmpl', require('engine-lodash'));

/**
 * Create a custom view collection
 */
app.create('pages');

/**
 * Load views onto the collection (globs work too)
 */

app.page('welcome.tmpl', {path: 'welcome.tmpl', content: 'Hello, <%= name %>!'})
  .page('goodbye.tmpl', {path: 'goodbye.tmpl', content: 'Goodbye, <%= name %>!'});

// get a template
var page = app.pages.get('welcome.tmpl');

// render the template
page.render({name: 'Bob'}, function (err, res) {
  if (err) return console.log(err);
  console.log(res.content);
  //=> 'Hello, Bob!'

  app.pages.get('goodbye.tmpl')
    .render({name: 'Bob'}, function (err, res) {
      if (err) return console.log(err);
      console.log(res.content);
      //=> 'Goodbye, Bob!'
    });
});
```

Docs are on the way. In the meantime, visit the [examples](./examples) and [unit tests](./test) to learn more about what Template can do.

## Table of contents

- [Install](#install)
- [API](#api)
- [Related projects](#related-projects)
- [Running tests](#running-tests)
- [Build docs](#build-docs)
- [Contributing](#contributing)
- [Authors](#authors)
- [License](#license)

## Install

Install with [npm](https://www.npmjs.com/)

```sh
$ npm i template --save
```

## API

See to the [API documentation](./docs/api.md).

### [Template](index.js#L47)

Create a new instance of `Template` with the given `options.

**Params**

* `options` **{Object}**

**Example**

```js
var app = require('template')();
```

### [.data](index.js#L159)

Load data onto `app.cache.data`

**Params**

* `key` **{String|Object}**: Key of the value to set, or object to extend.
* `val` **{any}**
* `returns` **{Object}**: Returns the instance of `Template` for chaining

**Example**

```js
console.log(app.cache.data);
//=> {};

app.data('a', 'b');
app.data({c: 'd'});
console.log(app.cache.data);
//=> {a: 'b', c: 'd'}
```

### [.create](index.js#L229)

Create a new `Views` collection.

**Params**

* `name` **{String}**: The name of the collection. Plural or singular form.
* `opts` **{Object}**: Collection options
* `loaders` **{String|Array|Function}**: Loaders to use for adding views to the created collection.
* `returns` **{Object}**: Returns the `Assemble` instance for chaining.

**Example**

```js
app.create('foo');
app.foo('*.hbs');
var view = app.foo.get('baz.hbs');
```

### [.handle](index.js#L345)

Handle middleware for the given `view` and locals.

**Params**

* `method` **{String}**: Router VERB
* `view` **{Object}**: View object
* `locals` **{Object}**
* `cb` **{Function}**
* `returns` **{Object}**

**Example**

```js
app.handle('customHandle', view);
```

### [.compile](index.js#L512)

Compile `content` with the given `locals`.

**Params**

* `view` **{Object|String}**: View object.
* `locals` **{Object}**
* `isAsync` **{Boolean}**: Load async helpers
* `returns` **{Object}**: View object with `fn` property with the compiled function.

**Example**

```js
var blogPost = app.post('2015-09-01-foo-bar');
var view = app.compile(blogPost);
// view.fn => [function]
```

### [.render](index.js#L565)

Render `content` with the given `locals` and `callback`.

**Params**

* `file` **{Object|String}**: String or normalized template object.
* `locals` **{Object}**: Locals to pass to registered view engines.
* `callback` **{Function}**

**Example**

```js
var blogPost = app.post('2015-09-01-foo-bar');
app.render(blogPost, function(err, view) {
  // `view` is an object with a rendered `content` property
});
```

## Related projects

* [assemble](https://www.npmjs.com/package/assemble): Static site generator for Grunt.js, Yeoman and Node.js. Used by Zurb Foundation, Zurb Ink, H5BP/Effeckt,… [more](https://www.npmjs.com/package/assemble) | [homepage](http://assemble.io)
* [en-route](https://www.npmjs.com/package/en-route): Routing for static site generators, build systems and task runners, heavily based on express.js routes… [more](https://www.npmjs.com/package/en-route) | [homepage](https://github.com/jonschlinkert/en-route)
* [layouts](https://www.npmjs.com/package/layouts): Wraps templates with layouts. Layouts can use other layouts and be nested to any depth.… [more](https://www.npmjs.com/package/layouts) | [homepage](https://github.com/doowb/layouts)
* [verb](https://www.npmjs.com/package/verb): Documentation generator for GitHub projects. Verb is extremely powerful, easy to use, and is used… [more](https://www.npmjs.com/package/verb) | [homepage](https://github.com/verbose/verb)

## Running tests

Install dev dependencies:

```sh
$ npm i -d && npm test
```

## Build docs

Install devDependencies:

```js
npm i -d && verb
```

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/jonschlinkert/template/issues/new).

## Authors

**Jon Schlinkert**

+ [github/jonschlinkert](https://github.com/jonschlinkert)
+ [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

## License

Copyright © 2014-2015 [Jon Schlinkert](https://github.com/jonschlinkert)
Released under the MIT license.

***

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on October 31, 2015._