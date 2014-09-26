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
### [Template](index.js#L43)

Create a new instance of `Template`, optionally passing the default `context` and `options` to use.

* `context` **{Object}**: Context object to start with.    
* `options` **{Object}**: Options to use.    

*Example:**

```js
var Template = require('engine');
var engine = new Template();
```

### [.addDelims](index.js#L284)

Cache delimiters by `name` with the given `options` for later use.

* `name` **{String}**: The name to use for the stored delimiters.    
* `delims` **{Array}**: Array of delimiter strings. See [delims] for details.    
* `opts` **{Object}**: Options to pass to [delims]. You can also use the options to override any of the generated delimiters.    

*Example:**

```js
template.addDelims('curly', ['']);
template.addDelims('angle', ['<%', '%>']);
template.addDelims('es6', ['${', '}'], {
// override the generated regex
interpolate: /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g
});
```

[delims]: https://github.com/jonschlinkert/delims "Generate regex for delimiters"

### [.useDelims](index.js#L320)

Specify by `ext` the delimiters to make active.

* `ext` **{String}**    

```js
template.useDelims('curly');
template.useDelims('angle');
```

### [.parser](index.js#L340)

Define a parser.

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

### [.parse](index.js#L367)

Run a stack of async parsers.

* `file` **{Object|String}**: Either a string or an object.    
* `stack` **{Array}**: Optionally pass an array of functions to use as parsers.    
* `options` **{Object}**    
* `returns` **{Object}**: Normalize `file` object.  

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


Run a `stack` of parsers against the given `file`. If `file` is
an object with a `path` property, then the `extname` is used to
get the parser stack. If a stack isn't found on the cache the
default `noop` parser will be used.

### [.parseSync](index.js#L388)

Run a stack of sync parsers.

* `file` **{Object|String}**: Either a string or an object.    
* `stack` **{Array}**: Optionally pass an array of functions to use as parsers.    
* `options` **{Object}**    
* `returns` **{Object}**: Normalize `file` object.  

```js
var str = fs.readFileSync('a/b/c.md', 'utf8');
template.parseSync({path: 'a/b/c.md', content: str});
```

Optionally pass an array of parser functions as a section argument.

```js
template.parseSync({path: 'a/b/c.md', content: str}, [a, b, c]);
```

See [parser-cache] for the full range of options and documentation.

Run a `stack` of sync parsers against the given `file`. If `file` is
an object with a `path` property, then the `extname` is used to
get the parser stack. If a stack isn't found on the cache the
default `noop` parser will be used.

### [.getParsers](index.js#L437)

* `ext` **{String}**: The parser stack to get.    
* `returns` **{Object}** `Template`: to enable chaining.  

Get the parser stack for the given `ext`.

### [.engine](index.js#L455)

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

### [.getEngine](index.js#L477)

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

### [.helpers](index.js#L496)

Register helpers for the given `ext` (engine).

* `ext` **{String}**: The engine to register helpers with.    
* `returns` **{Object}**: Object of helpers for the specified engine.  

```js
engine.helpers(require('handlebars-helpers'));
```

### [.helper](index.js#L516)

Register a helper for the given `ext` (engine).

* `ext` **{String}**: The engine to register helpers with.    
* `returns` **{Object}**: Object of helpers for the specified engine.  

```js
engine.helper('lower', function(str) {
return str.toLowerCase();
});
```

### [.addHelper](index.js#L561)

* `name` **{String}**: The helper to cache or get.    
* `fn` **{Function}**: The helper function.    
* `thisArg` **{Object}**: Context to bind to the helper.    
* `returns` **{Object}**: Object of helpers for the specified engine.  

Get and set _generic_ helpers on the `cache`. Helpers registered
using this method will be passed to every engine, so be sure to use
generic javascript functions - unless you want to see Lo-Dash
blow up from `Handlebars.SafeString`.

### [.addHelperAsync](index.js#L576)

* `name` **{String}**: The helper to cache or get.    
* `fn` **{Function}**: The helper function.    
* `thisArg` **{Object}**: Context to bind to the helper.    
* `returns` **{Object}**: Object of helpers for the specified engine.  

Async version of `.addHelper()`.

### [.create](index.js#L731)

* `type` **{String}**: Singular name of the type to create, e.g. `page`.    
* `plural` **{String}**: Plural name of the template type, e.g. `pages`.    
* `options` **{Object}**: Options for the template type.  
    - `renderable` **{Boolean}**: Is the template a partial view?
    - `layout` **{Boolean}**: Can the template be used as a layout?
    - `partial` **{Boolean}**: Can the template be used as a partial?
      
* `returns` **{Object}** `Template`: to enable chaining.  

Add a new template `type`, along with associated get/set methods.
You must specify both the singular and plural names for the type.

### [.render](index.js#L796)

* `file` **{Object|String}**: String or normalized template object.    
* `options` **{Object}**: Options to pass to registered view engines.    
* `returns`: {String}  

Render `str` with the given `options` and `callback`.

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

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on September 26, 2014._


[engine-cache]: https://github.com/jonschlinkert/engine-cache
[engine-noop]: https://github.com/jonschlinkert/engine-noop
[js-beautify]: https://github.com/einars/js-beautify
[parse-files]: https://github.com/jonschlinkert/parse-files
[parser-cache]: https://github.com/jonschlinkert/parser-cache
[parser-front-matter]: https://github.com/jonschlinkert/parser-front-matter
[parser-noop]: https://github.com/jonschlinkert/parser-noop
