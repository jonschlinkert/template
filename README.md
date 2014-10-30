# template [![NPM version](https://badge.fury.io/js/template.svg)](http://badge.fury.io/js/template)

> Render templates from any engine. Make custom template types, use built-in or custom delimiters, helpers, routes, middleware and lots more.

## Install
#### Install with [npm](npmjs.org):

```bash
npm i template --save-dev
```

## Usage

```js
var Template = require('template');
var template = new Template();
```

## API
### [Template](index.js#L54)

Create a new instance of `Template`, optionally passing default `options` to initialize with.

* `options` **{Object}**: Options to initialize with.    

**Example:**

```js
var Template = require('engine');
var engine = new Template();
```

### [.use](index.js#L275)

Proxy `Router#use()` to add middleware to the engine router. See Router#use() documentation for details.

If the _fn_ parameter is an engine, then it will be
mounted at the _route_ specified.

### [.route](index.js#L339)

Proxy to the engine `Router#route()` Returns a new `Route` instance for the _path_.

Routes are isolated middleware stacks for specific paths.
See the Route api docs for details.

### [.param](index.js#L356)

Proxy to `Router#param()` with one added api feature. The _name_ parameter can be an array of names.

* `name` **{String|Array}**    
* `fn` **{Function}**    
* `returns` **{engine}**: for chaining  

See the Router#param() docs for more details.

### [.all](index.js#L380)

* `path` **{String}**    
* **{Function}**: ...    
* `returns` **{engine}**: for chaining  

Special-cased "all" method, applying the given route `path`,
middleware, and callback.

### [.addDelims](index.js#L511)

Cache delimiters by `name` with the given `options` for later use.

* `name` **{String}**: The name to use for the stored delimiters.    
* `delims` **{Array}**: Array of delimiter strings. See [delims] for details.    
* `opts` **{Object}**: Options to pass to [delims]. You can also use the options to override any of the generated delimiters.    

**Example:**

```js
template.addDelims('curly', ['']);
template.addDelims('angle', ['<%', '%>']);
template.addDelims('es6', ['#{', '}'], {
  // override the generated regex
  interpolate: /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g
});
```

[delims]: https://github.com/jonschlinkert/delims "Generate regex for delimiters"

### [.useDelims](index.js#L563)

Specify by `ext` the delimiters to make active.

* `ext` **{String}**    

```js
template.useDelims('curly');
template.useDelims('angle');
```

### [.engine](index.js#L614)

* `exts` **{String|Array}**: File extension or array of extensions.    
* `fn` **{Function|Object}**: or `options`    
* `options` **{Object}**    
* `returns` **{Object}** `Template`: to enable chaining  

**Example:**

```js
var consolidate = require('consolidate')
template.engine('hbs', consolidate.handlebars);
template.engines('hbs');
// => {render: [function], renderFile: [function]}
```

See [engine-cache] for details and documentation.

Register the given view engine callback `fn` as `ext`. If only `ext`
is passed, the engine registered for `ext` is returned. If no `ext`
is passed, the entire cache is returned.

### [.getEngine](index.js#L640)

Get the engine object registered for the given `ext`. If no `ext` is passed, the entire cache is returned.

* `ext` **{String}**: The engine to get.    
* `returns` **{Object}**: Object with methods and settings for the specified engine.  

**Example:**

```js
var consolidate = require('consolidate')
template.engine('hbs', consolidate.handlebars);
template.getEngine('hbs');
// => {render: [function], renderFile: [function]}
```

```js
template.getEngine('.html');
```

### [.addHelper](index.js#L684)

Get and set _generic_ helpers on the `cache`.

* `name` **{String}**: The helper to cache or get.    
* `fn` **{Function}**: The helper function.    
* `thisArg` **{Object}**: Context to bind to the helper.    
* `returns` **{Object}**: Object of helpers for the specified engine.  

Helpers registered
using this method will be passed to every engine, so be sure to use
generic javascript functions - unless you want to see Lo-Dash
blow up from `Handlebars.SafeString`.

### [.helper](index.js#L705)

Register a helper for the given `ext` (engine). Register the given view engine callback `fn` as `ext`. If only `ext` is passed, the engine registered for `ext` is returned. If no `ext` is passed, the entire cache is returned.

* `ext` **{String}**: The engine to register helpers with.    
* `returns` **{Object}**: Object of helpers for the specified engine.  

```js
template.helper('lower', function(str) {
  return str.toLowerCase();
});
```

### [.helpers](index.js#L722)

Register an object of helpers for the given `ext` (engine).

* `ext` **{String}**: The engine to register helpers with.    
* `returns` **{Object}**: Object of helpers for the specified engine.  

```js
template.helpers(require('handlebars-helpers'));
```

### [.addHelperAsync](index.js#L737)

* `name` **{String}**: The helper to cache or get.    
* `fn` **{Function}**: The helper function.    
* `thisArg` **{Object}**: Context to bind to the helper.    
* `returns` **{Object}**: Object of helpers for the specified engine.  

Async version of `.addHelper()`.

### [.helperAsync](index.js#L756)

Register a helper for the given `ext` (engine).

* `ext` **{String}**: The engine to register helpers with.    
* `returns` **{Object}**: Object of helpers for the specified engine.  

```js
template.helperAsync('lower', function(str) {
  return str.toLowerCase();
});
```

### [.create](index.js#L889)

* `subtype` **{String}**: Singular name of the sub-type to create, e.g. `page`.    
* `plural` **{String}**: Plural name of the template type, e.g. `pages`.    
* `options` **{Object}**: Options for the template type.  
    - `isRenderable` **{Boolean}**: Is the template a partial view?
    - `layout` **{Boolean}**: Can the template be used as a layout?
    - `partial` **{Boolean}**: Can the template be used as a partial?
      
* `returns` **{Object}** `Template`: to enable chaining.  

Add a new template `sub-type`, along with associated get/set methods.
You must specify both the singular and plural names for the type.

### [.preprocess](index.js#L1123)

* `file` **{Object|String}**: String or normalized template object.    
* `options` **{Object}**: Options to pass to registered view engines.    
* `returns`: {String}  

Preprocess `str` with the given `options` and `callback`. A few
things to note.

### [.renderBase](index.js#L1212)

* `file` **{Object|String}**: String or normalized template object.    
* `options` **{Object}**: Options to pass to registered view engines.    
* `returns`: {String}  

Render `content` with the given `options` and `callback`.

### [.renderType](index.js#L1252)

* `str` **{String}**: The string to render.    
* `locals` **{Object}**: Locals and/or options to pass to registered view engines.    
* `returns`: {String}  

Render the given string with the specified `locals` and `callback`.

### [.renderCached](index.js#L1301)

* `name` **{String}**: Name of the cached template.    
* `locals` **{Object}**: Locals and/or options to pass to registered view engines.    
* `returns`: {String}  

Render `content` from the given cached template with the
given `locals` and `callback`.

### [.renderString](index.js#L1341)

* `str` **{String}**: The string to render.    
* `locals` **{Object}**: Locals and/or options to pass to registered view engines.    
* `returns`: {String}  

Render the given string with the specified `locals` and `callback`.

### [.render](index.js#L1371)

* `file` **{Object|String}**: String or normalized template object.    
* `options` **{Object}**: Options to pass to registered view engines.    
* `returns`: {String}  

Render `content` with the given `options` and `callback`.

### [.renderSync](index.js#L1401)

* `file` **{Object|String}**: String or normalized template object.    
* `options` **{Object}**: Options to pass to registered view engines.    
* `returns`: {String}  

Render `content` with the given `locals`.

## TODO

- [x] layouts
- [x] engines
- [x] parsers
- [x] allow `viewTypes` to set an engine to use for its templates.
- [x] allow user-defined `mergeFn` to merge context. This could be defined on, for example, `template.post('a', 'b', {mergeFn: _.defaults})`
- [x] logic for `.create()` plural. e.g. load templates
- [x] render views with partials passed in
- [x] render cached templates using the name of the cached template

**Data**

- [ ] `partials` namespacing
- [ ] merging `cache.data`
- [ ] matching `cache.data` and `partials` data
- [ ] `layouts` data

**Delimiters**

Allown delimiters to be defined:

- [x] when an engine is defined
- [x] when a template is defined
- [x] on the options

## Related

* [engine-cache]
* [engine-noop]
* [parse-files]
* [parser-cache]
* [parser-front-matter]
* [parser-noop]

## Author

**Jon Schlinkert**
 
+ [github/jonschlinkert](https://github.com/jonschlinkert)
+ [twitter/jonschlinkert](http://twitter.com/jonschlinkert) 

## License
Copyright (c) 2014 Jon Schlinkert, contributors.  
Released under the CC by 3.0, MIT licenses

***

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on October 30, 2014._


[engine-cache]: https://github.com/jonschlinkert/engine-cache
[engine-noop]: https://github.com/jonschlinkert/engine-noop
[js-beautify]: https://github.com/einars/js-beautify
[parse-files]: https://github.com/jonschlinkert/parse-files
[parser-cache]: https://github.com/jonschlinkert/parser-cache
[parser-front-matter]: https://github.com/jonschlinkert/parser-front-matter
[parser-noop]: https://github.com/jonschlinkert/parser-noop