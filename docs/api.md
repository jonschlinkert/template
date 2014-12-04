### [Template](../index.js#L56)

Create a new instance of `Template`, optionally passing default `options` to initialize with.

* `options` **{Object}**: Options to initialize with.    

**Example:**

```js
var Template = require('template');
var template = new Template();
```

### [.use](../index.js#L407)

Proxy to `Router#use()` to add middleware to the engine router. See Router#use() documentation for details.

* `fn` **{Function}**    

If the `fn` parameter is an engine, then it will be
mounted at the `route` specified.

### [.route](../index.js#L459)

Proxy to the engine `Router#route()` Returns a new `Route` instance for the `path`.

* `path` **{String}**    

Routes are isolated middleware stacks for specific paths.
See the Route api docs for details.

### [.param](../index.js#L478)

Proxy to `Router#param()` with one added api feature. The `name` parameter can be an array of names.

* `name` **{String|Array}**    
* `fn` **{Function}**    
* `returns` **{Object}** `Template`: for chaining  

See the Router#param() docs for more details.

Delegate `.METHOD(...)` calls to `router.METHOD(...)`

### [.all](../index.js#L526)

* `path` **{String}**    
* **{Function}**: Callback    
* `returns` **{Object}** `Template`: for chaining  

Special-cased "all" method, applying the given route `path`,
middleware, and callback.

### [.addDelims](../index.js#L631)

Cache delimiters by `name` with the given `options` for later use.

* `name` **{String}**: The name to use for the stored delimiters.    
* `delims` **{Array}**: Array of delimiter strings. See [delims] for details.    
* `opts` **{Object}**: Options to pass to [delims]. You can also use the options to override any of the generated delimiters.    

**Example:**

```js
template.addDelims('curly', ['{%', '%}']);
template.addDelims('angle', ['<%', '%>']);
template.addDelims('es6', ['${', '}'], {
  // override the generated regex
  interpolate: /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g
});
```

[delims]: https://github.com/jonschlinkert/delims "Generate regex for delimiters"

### [.useDelims](../index.js#L689)

Specify by `ext` the delimiters to make active.

* `ext` **{String}**    

```js
template.useDelims('curly');
template.useDelims('angle');
```

### [.handleDelims](../index.js#L711)

Specify by `ext` the delimiters to make active.

* `ext` **{String}**    

```js
template.useDelims('curly');
template.useDelims('angle');
```

### [.engine](../index.js#L781)

* `exts` **{String|Array}**: File extension or array of extensions.    
* `fn` **{Function|Object}**: or `options`    
* `options` **{Object}**    
* `returns` **{Object}** `Template`: to enable chaining  

{%= docs("api-engine") %}

Register the given view engine callback `fn` as `ext`. If only `ext`
is passed, the engine registered for `ext` is returned. If no `ext`
is passed, the entire cache is returned.

### [.getEngine](../index.js#L802)

Get the engine settings registered for the given `ext`.

* `ext` **{String}**: The engine to get.    
* `returns` **{Object}**: Object with methods and settings for the specified engine.  

{%= docs("api-getEngine") %}

```js
template.getEngine('.html');
```

### [.getExt](../index.js#L828)

Used in the `.render()` method to select the `ext` to use for picking an engine.

* `template` **{Object}**: Template object    
* `locals` **{Object}**: Locals object    
* `returns` **{String}** `ext`: For determining the engine to use.  

This logic can be overridden by passing a custom
function on `options.getExt`, e.g.:

**Example:**

```js
template.option('getExt', function(template, locals) {
  return path.extname(template.path);
});
```

### [.helper](../index.js#L932)

Register generic template helpers that are not specific to an engine.

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

### [.helpers](../index.js#L953)

Register multiple helpers.

* `helpers` **{Object|Array}**: Object, array of objects, or glob patterns.    

```js
template.addHelpers({
  a: function() {},
  b: function() {},
  c: function() {},
});
```

### [.asyncHelper](../index.js#L997)

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

### [.asyncHelpers](../index.js#L1018)

Register multiple async helpers.

* `helpers` **{Object|Array}**: Object, array of objects, or glob patterns.    

```js
template.addAsyncHelpers({
  a: function() {},
  b: function() {},
  c: function() {},
});
```

### [.engineHelpers](../index.js#L1036)

Register an object of helpers for the given `ext` (engine).

* `ext` **{String}**: The engine to register helpers with.    
* `returns` **{Object}**: Object of helpers for the specified engine.  

```js
template.helpers(require('handlebars-helpers'));
```

### [.validate](../index.js#L1193)

* `key` **{String}**: Template key    
* `value` **{Object}**: Template object    

Validate a template object to ensure that it has the properties
expected for applying layouts, choosing engines, and so on.

### [.view](../index.js#L1258)

* `collection` **{String}**    
* `name` **{String}**    
* `returns`: {Object}  

Get the given `collection` from views. Optionally
pass a `name` to get a specific template from the
collection.

### [.getType](../index.js#L1337)

Get all views of the given [type]. Valid values are `renderable`, `layout` or `partial`.

* `type` **{String}**    
* `opts` **{Object}**    

```js
var pages = template.getType('renderable');
//=> { pages: { 'home.hbs': { ... }, 'about.hbs': { ... }}, posts: { ... }}
```

[type]: ./template-types

### [.mergeType](../index.js#L1360)

Merge all collections of the given `type` into a single collection. e.g. `partials` and `includes` would be merged.

* `type` **{String}**: The template type to search.    
* `collections` **{String}**: Optionally pass an array of collections    

If an array of `collections` is passed, only those collections
will be merged and the order in which the collections are defined
in the array will be respected.

### [.mergeLayouts](../index.js#L1391)

Merge all `layout` collections based on user-defined options.

* `type` **{String}**: The template type to search.    
* `collections` **{String}**: Optionally pass an array of collections    

```js
## [.mergePartials](../index.js#L1434)

Default method for determining how partials are to be passed to engines. By default, all `partial` collections are merged onto a single `partials` object. To keep each collection on a separate object, you can do `template.disable('mergePartials')`.

* `locals` **{Object}**    
* `returns`: {Object}  

If you want to control how partials are merged, you can also
pass a function to the `mergePartials` option:

```js
template.option('mergePartials', function(locals) {
  // do stuff
});
```

### [.findRenderable](../index.js#L1505)

Search all renderable `subtypes`, returning the first template with the given `key`.

* `key` **{String}**: The template to search for.    
* `subtypes` **{Array}**    

  - If `key` is not found an error is thrown.
  - Optionally limit the search to the specified `subtypes`.

### [.findLayout](../index.js#L1521)

Search all layout `subtypes`, returning the first template with the given `key`.

* `key` **{String}**: The template to search for.    
* `subtypes` **{Array}**    

  - If `key` is not found an error is thrown.
  - Optionally limit the search to the specified `subtypes`.

### [.findPartial](../index.js#L1537)

Search all partial `subtypes`, returning the first template with the given `key`.

* `key` **{String}**: The template to search for.    
* `subtypes` **{Array}**    

  - If `key` is not found an error is thrown.
  - Optionally limit the search to the specified `subtypes`.

### [.lookup](../index.js#L1551)

* `plural` **{String}**: The view collection to search.    
* `name` **{String}**: The name of the template.    
* `ext` **{String}**: Optionally pass a file extension to append to `name`    

Convenience method for finding a template by `name` on
the given collection. Optionally specify a file extension.

### [.create](../index.js#L1588)

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

### [.compileTemplate](../index.js#L1728)

* `template` **{Object}**: The template object with content to compile.    
* `options` **{Object}**: Options to pass along to the engine when compile. May include a `context` property to bind to helpers.    
* `returns` **{Object}**: Template object to enable chaining.  

Compile content on the given `template` object with the specified
engine `options`.

### [.compile](../index.js#L1779)

* `file` **{Object|String}**: String or normalized template object.    
* `options` **{Object}**    
* `async` **{Boolean}**: Load async helpers    
* `returns` **{Function}**: Compiled function.  

Compile `content` with the given `options`.

### [.compileString](../index.js#L1811)

Compile the given string with the specified `options`.

* `str` **{String}**: The string to compile.    
* `options` **{Object}**: Options to pass to registered view engines.    
* `async` **{Boolean}**: Load async helpers    
* `returns`: {Function}  

The primary purpose of this method is to get the engine before
passing args to `.compileBase()`.

### [.renderTemplate](../index.js#L1861)

* `template` **{Object}**: The template object with content to render.    
* `locals` **{Object}**: Locals and/or options to pass to registered view engines.    
* `returns`: {String}  

Render content on the given `template` object with the specified
engine `options` and `callback`.

### [.render](../index.js#L2006)

* `file` **{Object|String}**: String or normalized template object.    
* `locals` **{Object}**: Locals and/or options to pass to registered view engines.    
* `returns` **{String}**: Rendered string.  

Render `content` with the given `options` and optional `callback`.

### [.renderString](../index.js#L2037)

Render the given string with the specified `locals` and `callback`.

* `str` **{String}**: The string to render.    
* `locals` **{Object}**: Locals and/or options to pass to registered view engines.    
* `returns`: {String}  

The primary purpose of this method is to get the engine before
passing args to `.renderBase()`.

### [.renderSubtype](../index.js#L2066)

Returns a render function for rendering templates of the given `subtype`.

* `plural` **{String}**: Template subtype, e.g. `pages`    
* `str` **{String}**: The string to render.    
* `locals` **{Object}**: Locals and/or options to pass to registered view engines.    
* `returns` **{Function}** `params`  

* `returns` **{String}** `string`: The rendered string.  

Mostly used internally as a private method, but it's exposed as a
public method since there are cases when it might be useful, like
for rendering templates in a gulp/grunt/assemble plugin.

### [.renderType](../index.js#L2098)

* `str` **{String}**: The string to render.    
* `locals` **{Object}**: Locals and/or options to pass to registered view engines.    
* `returns`: {String}  

Render the given string with the specified `locals` and `callback`.