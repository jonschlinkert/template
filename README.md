# engine [![NPM version](https://badge.fury.io/js/engine.svg)](http://badge.fury.io/js/engine)

> Render templates from any engine. Make custom template types, use built-in or custom delimiters, helpers, routes, middleware and lots more.

## Install
#### Install with [npm](npmjs.org):

```bash
npm i engine --save-dev
```

## Usage

```js
var Template = require('engine');
var template = new Template();
```

## API
### [Engine](index.js#L46)

Create a new instance of `Engine`, optionally passing default `options` to initialize with.

* `options` **{Object}**: Options to initialize with.    

**Example:**

```js
var Engine = require('engine');
var engine = new Engine();
```

### [.addDelims](index.js#L477)

Cache delimiters by `name` with the given `options` for later use.

* `name` **{String}**: The name to use for the stored delimiters.    
* `delims` **{Array}**: Array of delimiter strings. See [delims] for details.    
* `opts` **{Object}**: Options to pass to [delims]. You can also use the options to override any of the generated delimiters.    

**Example:**

```js
engine.addDelims('curly', ['']);
engine.addDelims('angle', ['<%', '%>']);
engine.addDelims('es6', ['#{', '}'], {
  // override the generated regex
  interpolate: /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g
});
```

[delims]: https://github.com/jonschlinkert/delims "Generate regex for delimiters"

### [.useDelims](index.js#L524)

Specify by `ext` the delimiters to make active.

* `ext` **{String}**    

```js
engine.useDelims('curly');
engine.useDelims('angle');
```

### [.engine](index.js#L573)

* `ext` **{String}**    
* `fn` **{Function|Object}**: or `options`    
* `options` **{Object}**    
* `returns` **{Object}** `Engine`: to enable chaining  

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

### [.getEngine](index.js#L596)

Get the engine registered for the given `ext`. If no `ext` is passed, the entire cache is returned.

* `ext` **{String}**: The engine to get.    
* `returns` **{Object}**: Object of methods for the specified engine.  

**Example:**

```js
var consolidate = require('consolidate')
template.engine('hbs', consolidate.handlebars);
template.getEngine('hbs');
// => {render: [function], renderFile: [function]}
```

```js
engine.getEngine('.html');
```

### [.helper](index.js#L640)

Register a helper for the given `ext` (engine).

* `ext` **{String}**: The engine to register helpers with.    
* `returns` **{Object}**: Object of helpers for the specified engine.  

```js
engine.addHelper('lower', function(str) {
  return str.toLowerCase();
});
```

### [.helpers](index.js#L658)

Register an object of helpers for the given `ext` (engine).

* `ext` **{String}**: The engine to register helpers with.    
* `returns` **{Object}**: Object of helpers for the specified engine.  

```js
engine.helpers(require('handlebars-helpers'));
```

### [.addHelper](index.js#L677)

* `name` **{String}**: The helper to cache or get.    
* `fn` **{Function}**: The helper function.    
* `thisArg` **{Object}**: Context to bind to the helper.    
* `returns` **{Object}**: Object of helpers for the specified engine.  

Get and set _generic_ helpers on the `cache`. Helpers registered
using this method will be passed to every engine, so be sure to use
generic javascript functions - unless you want to see Lo-Dash
blow up from `Handlebars.SafeString`.

### [.addHelperAsync](index.js#L693)

* `name` **{String}**: The helper to cache or get.    
* `fn` **{Function}**: The helper function.    
* `thisArg` **{Object}**: Context to bind to the helper.    
* `returns` **{Object}**: Object of helpers for the specified engine.  

Async version of `.addHelper()`.

### [.create](index.js#L765)

* `type` **{String}**: Singular name of the type to create, e.g. `page`.    
* `plural` **{String}**: Plural name of the template type, e.g. `pages`.    
* `options` **{Object}**: Options for the template type.  
    - `isRenderable` **{Boolean}**: Is the template a partial view?
    - `layout` **{Boolean}**: Can the template be used as a layout?
    - `partial` **{Boolean}**: Can the template be used as a partial?
      
* `returns` **{Object}** `Engine`: to enable chaining.  

Add a new template `type`, along with associated get/set methods.
You must specify both the singular and plural names for the type.

### [.preprocess](index.js#L980)

* `file` **{Object|String}**: String or normalized template object.    
* `options` **{Object}**: Options to pass to registered view engines.    
* `returns`: {String}  

Preprocess `str` with the given `options` and `callback`. A few
things to note.

### [.render](index.js#L1063)

* `file` **{Object|String}**: String or normalized template object.    
* `options` **{Object}**: Options to pass to registered view engines.    
* `returns`: {String}  

Render `content` with the given `options` and `callback`.

### [.renderSync](index.js#L1108)

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

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on October 22, 2014._


[engine-cache]: https://github.com/jonschlinkert/engine-cache
[engine-noop]: https://github.com/jonschlinkert/engine-noop
[js-beautify]: https://github.com/einars/js-beautify
[parse-files]: https://github.com/jonschlinkert/parse-files
[parser-cache]: https://github.com/jonschlinkert/parser-cache
[parser-front-matter]: https://github.com/jonschlinkert/parser-front-matter
[parser-noop]: https://github.com/jonschlinkert/parser-noop