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

### [.engine](index.js#L517)

* `exts` **{String|Array}**: File extension or array of extensions.    
* `fn` **{Function|Object}**: or `options`    
* `options` **{Object}**    
* `returns` **{Object}** `Template`: to enable chaining  

<%= docs("api-engine") %>

Register the given view engine callback `fn` as `ext`. If only `ext`
is passed, the engine registered for `ext` is returned. If no `ext`
is passed, the entire cache is returned.

### [.getEngine](index.js#L538)

Get the engine settings registered for the given `ext`.

* `ext` **{String}**: The engine to get.    
* `returns` **{Object}**: Object with methods and settings for the specified engine.  

<%= docs("api-getEngine") %>

```js
template.getEngine('.html');
```

### [.getExt](index.js#L565)

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

### [.helper](index.js#L604)

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

### [.helpers](index.js#L625)

Register multiple helpers.

* `helpers` **{Object|Array}**: Object, array of objects, or glob patterns.    

```js
template.addHelpers({
  a: function() {},
  b: function() {},
  c: function() {},
});
```

### [.asyncHelper](index.js#L657)

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

### [.asyncHelpers](index.js#L678)

Register multiple async helpers.

* `helpers` **{Object|Array}**: Object, array of objects, or glob patterns.    

```js
template.addAsyncHelpers({
  a: function() {},
  b: function() {},
  c: function() {},
});
```

### [.engineHelpers](index.js#L700)

Register an object of helpers for the given `ext` (engine).

* `ext` **{String}**: The engine to register helpers with.    
* `returns` **{Object}**: Object of helpers for the specified engine.  

```js
template.helpers(require('handlebars-helpers'));
```

### [.validate](index.js#L875)

* `template` **{String}**: a template object    

Validate a template object to ensure that it has the properties
expected for applying layouts, choosing engines, and so on.

### [.view](index.js#L930)

* `collection` **{String}**    
* `name` **{String}**    
* `returns`: {Object}  

Get the given view `collection` from views. Optionally
pass a `name` to get a specific template from the
collection.

### [.getType](index.js#L1013)

Get all views of the given [type]. Valid values are `renderable`, `layout` or `partial`.

* `type` **{String}**    
* `opts` **{Object}**    

```js
var pages = template.getType('renderable');
//=> { pages: { 'home.hbs': { ... }, 'about.hbs': { ... }}, posts: { ... }}
```

### [.mergeType](index.js#L1039)

Merge all collections of the given `type` into a single collection. e.g. `partials` and `includes` would be merged.

* `type` **{String}**: The template type to search.    
* `keys` **{String}**: Optionally pass an array of view collection names    

If an array of `collections` is passed, only those collections
will be merged and the order in which the collections are defined
in the array will be respected.

### [.mergeLayouts](index.js#L1068)

Merge all `layout` collections based on user-defined options.

* `type` **{String}**: The template type to search.    
* `collections` **{String}**: Optionally pass an array of collections    

```js

### [.mergePartials](index.js#L1116)

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

### [.findRenderable](index.js#L1205)

Search all renderable `subtypes`, returning the first template with the given `key`.

* `key` **{String}**: The template to search for.    
* `subtypes` **{Array}**    

  - If `key` is not found an error is thrown.
  - Optionally limit the search to the specified `subtypes`.

### [.findLayout](index.js#L1221)

Search all layout `subtypes`, returning the first template with the given `key`.

* `key` **{String}**: The template to search for.    
* `subtypes` **{Array}**    

  - If `key` is not found an error is thrown.
  - Optionally limit the search to the specified `subtypes`.

### [.findPartial](index.js#L1237)

Search all partial `subtypes`, returning the first template with the given `key`.

* `key` **{String}**: The template to search for.    
* `subtypes` **{Array}**    

  - If `key` is not found an error is thrown.
  - Optionally limit the search to the specified `subtypes`.

### [.lookup](index.js#L1251)

* `plural` **{String}**: The view collection to search.    
* `name` **{String}**: The name of the template.    
* `ext` **{String}**: Optionally pass a file extension to append to `name`    

Convenience method for finding a template by `name` on
the given collection. Optionally specify a file extension.

### [.create](index.js#L1284)

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

### [.compileTemplate](index.js#L1383)

* `template` **{Object}**: The template object with content to compile.    
* `options` **{Object}**: Options to pass along to the engine when compile. May include a `context` property to bind to helpers.    
* `returns` **{Object}**: Template object to enable chaining.  

Compile content on the given `template` object with the specified
engine `options`.

### [.compile](index.js#L1435)

* `file` **{Object|String}**: String or normalized template object.    
* `options` **{Object}**    
* `isAsync` **{Boolean}**: Load async helpers    
* `returns` **{Function}**: Compiled function.  

Compile `content` with the given `options`.

### [.compileString](index.js#L1467)

Compile the given string with the specified `options`.

* `str` **{String}**: The string to compile.    
* `options` **{Object}**: Options to pass to registered view engines.    
* `async` **{Boolean}**: Load async helpers    
* `returns`: {Function}  

The primary purpose of this method is to get the engine before
passing args to `.compileBase()`.

### [.renderTemplate](index.js#L1516)

* `template` **{Object}**: The template object with content to render.    
* `locals` **{Object}**: Locals and/or options to pass to registered view engines.    
* `returns`: {String}  

Render content on the given `template` object with the specified
engine `options` and `callback`.

### [.render](index.js#L1657)

* `file` **{Object|String}**: String or normalized template object.    
* `locals` **{Object}**: Locals and/or options to pass to registered view engines.    
* `returns` **{String}**: Rendered string.  

Render `content` with the given `options` and optional `callback`.

### [.renderString](index.js#L1685)

Render the given string with the specified `locals` and `callback`.

* `str` **{String}**: The string to render.    
* `locals` **{Object}**: Locals and/or options to pass to registered view engines.    
* `returns`: {String}  

The primary purpose of this method is to get the engine before
passing args to `.renderBase()`.

### [.renderSubtype](index.js#L1713)

Returns a render function for rendering templates of the given `subtype`.

* `plural` **{String}**: Template subtype, e.g. `pages`    
* `str` **{String}**: The string to render.    
* `locals` **{Object}**: Locals and/or options to pass to registered view engines.    
* `returns` **{Function}** `params`  

* `returns` **{String}** `string`: The rendered string.  

Mostly used internally as a private method, but it's exposed as a
public method since there are cases when it might be useful, like
for rendering templates in a gulp/grunt/assemble plugin.

### [.renderType](index.js#L1745)

* `str` **{String}**: The string to render.    
* `locals` **{Object}**: Locals and/or options to pass to registered view engines.    
* `returns`: {String}  

Render the given string with the specified `locals` and `callback`.
