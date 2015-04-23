# template [![NPM version](https://badge.fury.io/js/template.svg)](http://badge.fury.io/js/template)  [![Build Status](https://travis-ci.org/jonschlinkert/template.svg)](https://travis-ci.org/jonschlinkert/template)  [![Coverage Status](https://img.shields.io/coveralls/jonschlinkert/template.svg)](https://coveralls.io/r/jonschlinkert/template)

> Render templates using any engine. Supports, layouts, pages, partials and custom template types. Use template helpers, middleware, routes, loaders, and lots more. Powers assemble, verb and other node.js apps.

Go to the [API documentation](./docs/api.md)

- **~100% test coverage** (as of Apr. 23, 2015) with [~500 unit tests](./tests)
- **Render** templates with any engine, including any [consolidate](https://github.com/tj/consolidate.js),
  [transformers](https://github.com/ForbesLindesay/transformers), or any compatible engine. Or, create your own!
- **Create custom template types**. Built-in types are `page`, `layout` and `partial`, but you can create special types for any use case.
- **Custom loaders**. Loaders are simple functions that change how templates are loaded and can be used with template types, or individual templates.

## Install with [npm](npmjs.org)

```bash
npm i template --save
```

## Usage

```js
var Template = require('template');
var template = new Template();
```

### Define a template

```js
template.page('home.tmpl', 'This home page.');

// add locals
template.page('home.tmpl', 'The <%= title %> page', {title: 'home'});
```

## Docs

## [Debugging](docs/debugging.md)

- [Debugging](docs/debugging.md/#debugging)
  * [Running debug](docs/debugging.md/#running-debug)
  * [Windows](docs/debugging.md/#windows)


## API

### [Template](index.js#L59)

Create a new instance of `Template`, optionally passing default `options` to initialize with.

* `options` **{Object}**: Options to initialize with.    

**Example:**

```js
var Template = require('template');
var template = new Template();
```

### [.transform](index.js#L225)

Assign transform `fn` to `name` or return the value of `name` if no other arguments are passed.

* `name` **{String}**: The name of the transform to add.    
* `fn` **{Function}**: The actual transform function.    
* `returns` **{Object}**: Returns `Template` for chaining.  

Transforms are run immediately during init, and are used to
extend or modify the `cache.data` object, but really anything
on the `this` object can be tranformed.

```js
template.transform('username', function(app) {
  var url = app.cache.data.author.url.split('/');
  app.cache.data.username = url[2];
});
```

### [.route](index.js#L303)

Proxy to the engine `Router#route()` Returns a new `Route` instance for the `path`.

* `path` **{String}**    

Routes are isolated middleware stacks for specific paths.
See the `Route` api docs for details.

### [.param](index.js#L321)

Proxy to `Router#param()` with one added api feature. The `name` parameter can be an array of names.

* `name` **{String|Array}**    
* `fn` **{Function}**    
* `returns` **{Object}** `Template`: for chaining  

See the `Router#param()` docs for more details.

Delegate `.METHOD(...)` calls to `router.METHOD(...)`

### [.all](index.js#L431)

Special-cased "all" method, applying the given route `path`, middleware, and callback.

* `path` **{String}**    
* **{Function}**: Callback    
* `returns` **{Object}** `Template`: for chaining  

```js
template.all(/\.md$/, function (file, next) {
  // do stuff next();
});
```

### [.engine](index.js#L516)

* `exts` **{String|Array}**: File extension or array of extensions.    
* `fn` **{Function|Object}**: or `options`    
* `options` **{Object}**    
* `returns` **{Object}** `Template`: to enable chaining  

<%= docs("api-engine") %>

Register the given view engine callback `fn` as `ext`. If only `ext`
is passed, the engine registered for `ext` is returned. If no `ext`
is passed, the entire cache is returned.

### [.getEngine](index.js#L537)

Get the engine settings registered for the given `ext`.

* `ext` **{String}**: The engine to get.    
* `returns` **{Object}**: Object with methods and settings for the specified engine.  

<%= docs("api-getEngine") %>

```js
template.getEngine('.html');
```

### [.helper](index.js#L561)

Register generic template helpers that can be used with any engine.

* `key` **{String}**: Helper name    
* `fn` **{Function}**: Helper function.    

Helpers registered using this method will be passed to every
engine, so this method is best for generic javascript functions -
unless you want to see Lo-Dash blow up from `Handlebars.SafeString`.

```js
template.helper('lower', function(str) {
  return str.toLowerCase();
});
```

### [.helpers](index.js#L582)

Register multiple helpers.

* `helpers` **{Object|Array}**: Object, array of objects, or glob patterns.    

```js
template.addHelpers({
  a: function() {},
  b: function() {},
  c: function() {},
});
```

### [.asyncHelper](index.js#L614)

Register generic async template helpers that are not specific to an engine.

* `name` **{String}**: Helper name.    
* `fn` **{Function}**: Helper function    

As with the sync version, helpers registered using this method will
be passed to every engine, so this method is best for generic
javascript functions.

```js
template.asyncHelper('lower', function(str, next) {
  str = str.toLowerCase();
  next();
});
```

### [.asyncHelpers](index.js#L635)

Register multiple async helpers.

* `helpers` **{Object|Array}**: Object, array of objects, or glob patterns.    

```js
template.addAsyncHelpers({
  a: function() {},
  b: function() {},
  c: function() {},
});
```

### [.engineHelpers](index.js#L657)

Register an object of helpers for the given `ext` (engine).

* `ext` **{String}**: The engine to register helpers with.    
* `returns` **{Object}**: Object of helpers for the specified engine.  

```js
template.helpers(require('handlebars-helpers'));
```

### [.validate](index.js#L832)

* `template` **{String}**: a template object    

Validate a template object to ensure that it has the properties
expected for applying layouts, choosing engines, and so on.

### [.view](index.js#L887)

* `collection` **{String}**    
* `name` **{String}**    
* `returns`: {Object}  

Get the given view `collection` from views. Optionally
pass a `name` to get a specific template from the
collection.

### [.getType](index.js#L970)

Get all views of the given [type]. Valid values are `renderable`, `layout` or `partial`.

* `type` **{String}**    
* `opts` **{Object}**    

```js
var pages = template.getType('renderable');
//=> { pages: { 'home.hbs': { ... }, 'about.hbs': { ... }}, posts: { ... }}
```

### [.mergeType](index.js#L996)

Merge all collections of the given `type` into a single collection. e.g. `partials` and `includes` would be merged.

* `type` **{String}**: The template type to search.    
* `keys` **{String}**: Optionally pass an array of view collection names    

If an array of `collections` is passed, only those collections
will be merged and the order in which the collections are defined
in the array will be respected.

### [.mergeLayouts](index.js#L1022)

* `type` **{String}**: The template type to search.    
* `collections` **{String}**: Optionally pass an array of collections    

Merge all `layout` collections based on user-defined options.

### [.mergePartials](index.js#L1070)

Default method for determining how partials are to be passed to engines. By default, all `partial` collections are merged onto a single `partials` object. To keep each collection on a separate object, you can do `template.disable('mergePartials')`.

* `locals` **{Object}**: Locals should have layout delimiters, if defined    
* `returns`: {Object}  

If you want to control how partials are merged, you can also
pass a function to the `mergePartials` option:

```js
template.option('mergePartials', function(locals) {
  // do stuff
});
```

### [.findRenderable](index.js#L1157)

Search all renderable `subtypes`, returning the first template with the given `key`.

* `key` **{String}**: The template to search for.    
* `subtypes` **{Array}**    

  - If `key` is not found an error is thrown.
  - Optionally limit the search to the specified `subtypes`.

### [.findLayout](index.js#L1173)

Search all layout `subtypes`, returning the first template with the given `key`.

* `key` **{String}**: The template to search for.    
* `subtypes` **{Array}**    

  - If `key` is not found an error is thrown.
  - Optionally limit the search to the specified `subtypes`.

### [.findPartial](index.js#L1189)

Search all partial `subtypes`, returning the first template with the given `key`.

* `key` **{String}**: The template to search for.    
* `subtypes` **{Array}**    

  - If `key` is not found an error is thrown.
  - Optionally limit the search to the specified `subtypes`.

### [.lookup](index.js#L1203)

* `plural` **{String}**: The view collection to search.    
* `name` **{String}**: The name of the template.    
* `ext` **{String}**: Optionally pass a file extension to append to `name`    

Convenience method for finding a template by `name` on
the given collection. Optionally specify a file extension.

### [.create](index.js#L1236)

Create a new `view` collection and associated convience methods.

* `subtype` **{String}**: Singular name of the collection to create, e.g. `page`.    
* `plural` **{String}**: Plural name of the collection, e.g. `pages`.    
* `options` **{Object}**: Options for the collection.  
    - `isRenderable` **{Boolean}**: Templates that may be rendered at some point
    - `isLayout` **{Boolean}**: Templates to be used as layouts
    - `isPartial` **{Boolean}**: Templates to be used as partial views or includes
      
* `stack` **{Function|Array}**: Loader function or functions to be run for every template of this type.    
* `returns` **{Object}** `Template`: to enable chaining.  

Note that when you only specify a name for the type, a plural form is created
automatically (e.g. `page` and `pages`). However, you can define the
`plural` form explicitly if necessary.

### [.compileTemplate](index.js#L1335)

* `template` **{Object}**: The template object with content to compile.    
* `options` **{Object}**: Options to pass along to the engine when compile. May include a `context` property to bind to helpers.    
* `returns` **{Object}**: Template object to enable chaining.  

Compile content on the given `template` object with the specified
engine `options`.

### [.compile](index.js#L1378)

* `file` **{Object|String}**: String or normalized template object.    
* `options` **{Object}**    
* `isAsync` **{Boolean}**: Load async helpers    
* `returns` **{Function}**: Compiled function.  

Compile `content` with the given `options`.

### [.compileString](index.js#L1408)

Compile the given string with the specified `options`.

* `str` **{String}**: The string to compile.    
* `options` **{Object}**: Options to pass to registered view engines.    
* `async` **{Boolean}**: Load async helpers    
* `returns`: {Function}  

The primary purpose of this method is to get the engine before
passing args to `.compileBase()`.

### [.renderTemplate](index.js#L1457)

* `template` **{Object}**: The template object with content to render.    
* `locals` **{Object}**: Locals and/or options to pass to registered view engines.    
* `returns`: {String}  

Render content on the given `template` object with the specified
engine `options` and `callback`.

### [.render](index.js#L1589)

* `file` **{Object|String}**: String or normalized template object.    
* `locals` **{Object}**: Locals and/or options to pass to registered view engines.    
* `returns` **{String}**: Rendered string.  

Render `content` with the given `options` and optional `callback`.

### [.renderString](index.js#L1617)

Render the given string with the specified `locals` and `callback`.

* `str` **{String}**: The string to render.    
* `locals` **{Object}**: Locals and/or options to pass to registered view engines.    
* `returns`: {String}  

The primary purpose of this method is to get the engine before
passing args to `.renderBase()`.

### [.renderSubtype](index.js#L1645)

Returns a render function for rendering templates of the given `subtype`.

* `plural` **{String}**: Template subtype, e.g. `pages`    
* `str` **{String}**: The string to render.    
* `locals` **{Object}**: Locals and/or options to pass to registered view engines.    
* `returns` **{Function}** `params`  

* `returns` **{String}** `string`: The rendered string.  

Mostly used internally as a private method, but it's exposed as a
public method since there are cases when it might be useful, like
for rendering templates in a gulp/grunt/assemble plugin.

### [.renderType](index.js#L1677)

* `str` **{String}**: The string to render.    
* `locals` **{Object}**: Locals and/or options to pass to registered view engines.    
* `returns`: {String}  

Render the given string with the specified `locals` and `callback`.

### Render a template

Using the default Lo-Dash engine:

```js
template.render('home.tmpl', function(err, html) {
  if (err) throw err;
  console.log(html); //=> 'The home page.'
});
```

Or you can pass a string (non-cached template):

```js
template.render('foo bar', function(err, html) {
  if (err) throw err;
  console.log(html); //=> 'foo bar'
});
```

**Locals**

Pass `locals` as the second parameter:

```js
template.render('foo <%= bar %>', {bar: 'baz'}, function(err, html) {
  if (err) throw err;
  console.log(html); //=> 'foo baz'
});
```

## Register an engine

Register 

**Examples**

```js
// use handlebars to render templates with the `.hbs` extension
template.engine('hbs', require('engine-handlebars'));

// use lo-dash to render templates with the `.tmpl` extension
template.engine('tmpl', require('engine-lodash'));
```

**Using consolidate.js**

You can also use consolidate:

```js
var consolidate = require('consolidate');
template.engine('hbs', consolidate.handlebars);
template.engine('tmpl', consolidate.lodash);
```

**Using a custom function**

Example of creating an engine to render `.less` files:

```js
var less = require('less');

template.engine('less', function(str, options, cb) {
  less.render(str, options, function (err, res) {
    if (err) { return cb(err); }
    cb(null, res.css);
  });
});
```

You can also use [engine-less](https://github.com/jonschlinkert/engine-less).

## Load templates

As glob patterns:

```js
template.pages('pages/*.hbs');
template.pages(['partials/*.hbs', 'includes/*.hbs']);
```

As key/value pairs:

```js
template.page('home', 'This is home.');
template.page('home', 'This is <%= title %>.', {title: 'home'});
template.page('home', {content: 'This is home.'});
template.page('home', {content: 'This is <%= title %>.', title: 'home'});
template.page('home', {content: 'This is <%= title %>.'}, {title: 'home'});
```

_Note any of the above examples will work with either the singular or plural methods (e.g. page/pages)_

## Custom templates

Built-in template types are:

 - `page`: the default `renderable` template type
 - `layout`: the default `layout` template type
 - `partial`: the default `partial` template type

If you need something different, add your own:

```js
template.create('post', { isRenderable: true, isPartial: true });
template.create('section', { isLayout: true });
template.create('include', { isPartial: true });
```

Setting `isRenderable`, `isLayout` and `isPartial` will add special convenience methods to the new template type. For example, when `isRenderable` is true, any templates registered for that that type can be rendered directly by passing the name of a template to the `.render()` method.

**Loading custom templates**

We can now load posts using the `.post()` or `.posts()` methods, the same way that pages or other [default templates are loaded](#load-templates):

```js
template.posts('my-blog-post', 'This is content...');
```

_Note: if you create a new template type with a weird plural form, like `cactus`, you can pass `cacti` as a second arg. e.g. `template.create('cactus', 'cactii')`_


1. `post` will belong to both the `renderable` and `partial` types. This means that `posts` can be used as partials, and they will be "findable" on the cache by the render methods. Renderable templates also get their own render methods, but more on that later.
2. `section` will belong to the `layout` type. This means that any `section` template can be used as a layout for other templates.
2. `include` will belong to the `partial` type. This means that any `include` template can be used as partial by other templates.


## Custom loaders

Every template subtype uses a built-in loader to load and/or resolve templates. However, if you need something different, just add your own.

Pass an array of functions, each can take any arguments, but the last must pass an object to the callback:

```js
template.create('component', { isPartial: true }, [
  function (filepath, next) {
    var str = fs.readFileSync(filepath, 'utf8');
    var file = {};
    file[filepath] = {path: filepath, content: str};
    return file;
  }]
);
```

Now, every `component` will use this loader.

```js
template.component('components/navbar.html');
//=> {'components/navbar.html': {path: 'components/navbar.html', content: '...'}};
```

### Template-specific loaders

When the last argument passed to a template is an array, or more specifically an array of functions, that array will be concatenated to the loader array for the template's subtype.

**Example**

```js
template.component('components/navbar.html', [
  function(file) {
    file.data = file.data || {foo: 'bar'};
    return file;
  },
  function(file) {
    file.opts = file.opts || {baz: 'quux'};
    return file;
  }]
});
//=> {navbar: {path: 'components/navbar.html', content: '...', data: {foo: 'bar'}}};
```


### Loader requirements

As mentioned in the previous section, loader functions may take any arguments long as the last function returns a _valid template object_.

**Valid template object**

A valid template object is a key/value pair that looks like this:

```js
// {key: value}
{'foo.txt': {content: 'this is content'}};
```

- `key` **{String}**: the unique identifier for the template. Usually a name or the filepath that was used for loading the template
- `value` **{Object}**: the actual template object, `value` must have the following properties:
    * `content` **{String}**: the string to be rendered

Any additional properties may be added. Useful ones are:

 - `path` **{String}**: If present, can be used to determine engines, delimiters, etc.
 - `ext` **{String}**: Like `path`, can be used to determine engines, delimiters, etc.
 - `options` **{Object}**: If present, options are passed to engines, and can also be useful in determining engines, delimiters, etc.
 - `locals` **{Object}**: data to pass to templates

## Related

Libraries that are used in Template:

{%= related(['layouts', 'bluebird', 'async', 'config-cache', 'en-route', 'engine-cache', 'helper-cache', 'loader-cache']) %}

## Run tests
Install dev dependencies:

```bash
npm i -d && npm test
```

## Build docs

Install devDependencies:

```js
npm i -d && verb
```

## Contributing
Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/jonschlinkert/template/issues)

## Authors
 
**Jon Schlinkert**
 
+ [github/jonschlinkert](https://github.com/jonschlinkert)
+ [twitter/jonschlinkert](http://twitter.com/jonschlinkert) 
 
**Brian Woodward**
 
+ [github/doowb](https://github.com/doowb)
+ [twitter/doowb](http://twitter.com/doowb) 


## License
Copyright (c) 2014-2015 Jon Schlinkert
Released under the MIT license.

***

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on April 23, 2015._


[engine-cache]: https://github.com/jonschlinkert/engine-cache
[engine-noop]: https://github.com/jonschlinkert/engine-noop
[parse-files]: https://github.com/jonschlinkert/parse-files
[parser-cache]: https://github.com/jonschlinkert/parser-cache
[parser-front-matter]: https://github.com/jonschlinkert/parser-front-matter
[parser-noop]: https://github.com/jonschlinkert/parser-noop
[delimiters]: https://github.com/jonschlinkert/delimiters "Generate regex for delimiters"
<!-- deps:load-templates handlebars coveralls istanbul jshint-stylish mocha swig -->

<!-- reflinks generated by verb-reflinks plugin -->

[verb]: https://github.com/assemble/verb
[template]: https://github.com/jonschlinkert/template
[assemble]: http://assemble.io