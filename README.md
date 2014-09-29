# template [![NPM version](https://badge.fury.io/js/template.svg)](http://badge.fury.io/js/template)


> Templates.

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
### [Template](index.js#L47)

Create a new instance of `Template`, optionally passing the default `context` and `options` to use.

* `context` **{Object}**: Context object to start with.    
* `options` **{Object}**: Options to use.    

*Example:**

```js
var Template = require('template');
var template = new Template();
```

### [.addDelims](index.js#L319)

Cache delimiters by `name` with the given `options` for later use.

* `name` **{String}**: The name to use for the stored delimiters.    
* `delims` **{Array}**: Array of delimiter strings. See [delims] for details.    
* `opts` **{Object}**: Options to pass to [delims]. You can also use the options to override any of the generated delimiters.    

*Example:**

```js
template.addDelims('curly', ['']);
template.addDelims('angle', ['<%', '%>']);
template.addDelims('es6', ['#{', '}'], {
// override the generated regex
interpolate: /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g
});
```

[delims]: https://github.com/jonschlinkert/delims "Generate regex for delimiters"

### [.useDelims](index.js#L366)

Specify by `ext` the delimiters to make active.

* `ext` **{String}**    

```js
template.useDelims('curly');
template.useDelims('angle');
```

### [.getParsers](index.js#L380)

* `ext` **{String}**: The parser stack to get.    
* `returns` **{Object}** `Template`: to enable chaining.  

Get the parser stack for the given `ext`.

### [.registerParser](index.js#L418)

Register the given parser callback `fn` as `ext`. If `ext` is not given, the parser `fn` will be pushed into the default parser stack.

* `ext` **{String}**    
* `fn` **{Function|Object}**: or `options`    
* `returns` **{Object}** `parsers`: to enable chaining.  

```js
// Push the parser into the default stack
template.registerParser(require('parser-front-matter'));

// Or push the parser into the `foo` stack
template.registerParser('foo', require('parser-front-matter'));
```

### [.parser](index.js#L475)

Define an async parser.

* `ext` **{String}**    
* `fn` **{Function|Object}**: or `options`    
* `fn` **{Function}**: Callback function.    
* `returns` **{Object}** `Template`: to enable chaining.  

```js
// Default stack
template.parser(require('parser-front-matter'));

// Associated with `.hbs` file extension
template.parser('hbs', require('parser-front-matter'));
```

See [parser-cache] for the full range of options and documentation.


Register the given parser callback `fn` as `ext`. If `ext`
is not given, the parser `fn` will be pushed into the
default parser stack.

### [.parserSync](index.js#L499)

Define a synchronous parser.

* `ext` **{String}**    
* `fn` **{Function|Object}**: or `options`    
* `fn` **{Function}**: Callback function.    
* `returns` **{Object}** `Template`: to enable chaining.  

```js
// Default stack
template.parser(require('parser-front-matter'));

// Associated with `.hbs` file extension
template.parser('hbs', require('parser-front-matter'));
```

See [parser-cache] for the full range of options and documentation.


Register the given parser callback `fn` as `ext`. If `ext`
is not given, the parser `fn` will be pushed into the
default parser stack.

### [.parse](index.js#L549)

Run a stack of sync or async parsers.

* `template` **{Object|String}**: Either a string or an object.    
* `stack` **{Array}**: Optionally pass an array of functions to use as parsers.    
* `options` **{Object}**    
* `returns` **{Object}**: Normalize `template` object.  

**Examples:**

```js
var str = fs.readFileSync('a/b/c.md', 'utf8');
template.parse({path: 'a/b/c.md', content: str}, function (err, file) {
  if (err) console.log(err);
  console.log(file);
});
```

Optionally pass an array of parser functions as a section argument.

```js
template.parse({path: 'a/b/c.md', content: str}, [a, b, c], function (err, file) {
  if (err) console.log(err);
  console.log(file);
});
```

See [parser-cache] for the full range of options and documentation.


Run a `stack` of parsers against the given `template`. If `template` is
an object with a `path` property, then the `extname` is used to
get the parser stack. If a stack isn't found on the cache the
default `noop` parser will be used.

### [.engine](index.js#L596)

* `ext` **{String}**    
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

### [.getEngine](index.js#L650)

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

### [.addMixin](index.js#L671)

Assign mixin `fn` to `name` or return the value of `name` if no other arguments are passed.

* `name` **{String}**: The name of the mixin to add.    
* `fn` **{Function}**: The actual mixin function.    

This method sets mixins on the cache, which will later be
passed to a template engine that uses mixins, such as
Lo-Dash or Underscore.

### [.helper](index.js#L694)

Register a helper for the given `ext` (engine).

* `ext` **{String}**: The engine to register helpers with.    
* `returns` **{Object}**: Object of helpers for the specified engine.  

```js
engine.addHelper('lower', function(str) {
return str.toLowerCase();
});
```

### [.helpers](index.js#L713)

Register helpers for the given `ext` (engine).

* `ext` **{String}**: The engine to register helpers with.    
* `returns` **{Object}**: Object of helpers for the specified engine.  

```js
engine.helpers(require('handlebars-helpers'));
```

### [.addHelper](index.js#L733)

* `name` **{String}**: The helper to cache or get.    
* `fn` **{Function}**: The helper function.    
* `thisArg` **{Object}**: Context to bind to the helper.    
* `returns` **{Object}**: Object of helpers for the specified engine.  

Get and set _generic_ helpers on the `cache`. Helpers registered
using this method will be passed to every engine, so be sure to use
generic javascript functions - unless you want to see Lo-Dash
blow up from `Handlebars.SafeString`.

### [.addHelperAsync](index.js#L749)

* `name` **{String}**: The helper to cache or get.    
* `fn` **{Function}**: The helper function.    
* `thisArg` **{Object}**: Context to bind to the helper.    
* `returns` **{Object}**: Object of helpers for the specified engine.  

Async version of `.addHelper()`.

### [.create](index.js#L839)

* `type` **{String}**: Singular name of the type to create, e.g. `page`.    
* `plural` **{String}**: Plural name of the template type, e.g. `pages`.    
* `options` **{Object}**: Options for the template type.  
    - `isRenderable` **{Boolean}**: Is the template a partial view?
    - `layout` **{Boolean}**: Can the template be used as a layout?
    - `partial` **{Boolean}**: Can the template be used as a partial?
      
* `returns` **{Object}** `Template`: to enable chaining.  

Add a new template `type`, along with associated get/set methods.
You must specify both the singular and plural names for the type.

### [.preprocess](index.js#L1015)

* `file` **{Object|String}**: String or normalized template object.    
* `options` **{Object}**: Options to pass to registered view engines.    
* `returns`: {String}  

Preprocess `str` with the given `options` and `callback`.

### [.render](index.js#L1090)

* `file` **{Object|String}**: String or normalized template object.    
* `options` **{Object}**: Options to pass to registered view engines.    
* `returns`: {String}  

Render `content` with the given `options` and `callback`.

### [.renderSync](index.js#L1125)

* `file` **{Object|String}**: String or normalized template object.    
* `options` **{Object}**: Options to pass to registered view engines.    
* `returns`: {String}  

Render `content` with the given `options` and `callback`.

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
Released under the MIT license

***

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on September 28, 2014._


[engine-cache]: https://github.com/jonschlinkert/engine-cache
[engine-noop]: https://github.com/jonschlinkert/engine-noop
[js-beautify]: https://github.com/einars/js-beautify
[parse-files]: https://github.com/jonschlinkert/parse-files
[parser-cache]: https://github.com/jonschlinkert/parser-cache
[parser-front-matter]: https://github.com/jonschlinkert/parser-front-matter
[parser-noop]: https://github.com/jonschlinkert/parser-noop
