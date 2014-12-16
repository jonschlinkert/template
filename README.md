# template [![NPM version](https://badge.fury.io/js/template.svg)](http://badge.fury.io/js/template) [![Coverage Status](https://img.shields.io/coveralls/jonschlinkert/template.svg)](https://coveralls.io/r/jonschlinkert/template)

> Render templates from any engine. Make custom template types, use layouts on pages, partials or any custom template type, custom delimiters, helpers, middleware, routes, loaders, and lots more. Powers Assemble v0.6.0, Verb v0.3.0 and your application.

- **Render** templates with any engine, including any [consolidate](https://github.com/tj/consolidate.js),
  [transformers](https://github.com/ForbesLindesay/transformers), or any compatible engine. Or, create your own!
- **Create custom template types**. Built-in types are `page`, `layout` and `partial`, but you can create special types for any use case.
- **Custom loaders**. Loaders are simple functions that change how templates are loaded and can be used with template types, or individual templates.
- **100% test coverage** (as of Dec. 16, 2014) with [~500 unit tests](./tests)

## Install

**node.js:**

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
// define a template: key/value, with optional locals
template.page('home.tmpl', '<%= a %> <%= b %>', {b: 'my site!'});
```

### Render

Using the default Lo-Dash engine, the following are all valid:

```js
// pass the name of the template we created, with optionally locals
template.render('home.tmpl', {a: 'Welcome to '}, function(err, html) {
  if (err) throw err;
  console.log(html); //=> 'Welcome to my site!'
});

// or you can pass a string
template.render('My <%= title %>', {title: 'site'}, function(err, html) {
  if (err) throw err;
  console.log(html);
});
```

## Register an engine

The `name` of the engine is used to automatically render templates with that file extension:

```js
var consolidate = require('consolidate');
template.engine('hbs', consolidate.handlebars);

// load a template
template.pages('about.hbs', {content: '{{title}} page.'});

// render a
template.render('about.hbs', {title: 'About'}, function(err, html) {
  if (err) throw err;
  console.log(html); //=> 'About page'
});
```

## Load templates

Load templates using glob patterns:

```js
// both singular/plural forms work (e.g. `page` and `pages`)
template.pages('pages/*.hbs');
template.layouts('layouts/*.hbs');
template.partials(['partials/*.hbs', 'includes/*.hbs']);
```

Or as key/value pairs:

```js
template.page('home', {content: 'This is the home page'});

// Or
template.page('home', 'This is the home page');

// or with optional `locals` and `options`
template.page('home', 'This is the home page', {title: 'Home'}, {foo: true});
```

## Custom template sub-types

Template types are `renderable`, `partial` and `layout`, each of which may have any number of associated `subtypes`.

Built-in subtypes are:

 - `page`: the default `renderable` subtype
 - `layout`: the default `layout` subtype
 - `partial`: the default `partial` subtype

If you need something different, create your own `subtype`s:

```js
template.create('post', { isRenderable: true, isPartial: true });
template.create('section', { isLayout: true });
template.create('include', { isPartial: true });
```

**Load templates**

Now, to load templates for our custom subtypes, we simply do:

```js
template.posts('posts/*.md');
```

...and all together:


```js
// `{% body %}` is a special syntax that layout templates can use to inject content
template.section('article', '<section>{% body %}</section>');
template.include('sidebar', '<nav><ul>...</ul></nav>');

template.post('my-blog-post', {
  content: 'This is content <%= include("sidebar") %>',
  layout: 'article'
});
```

_Note: if you create a subtype with a weird plural form, like `cactus`, you can pass `cacti` as a second arg._.


1. `post` will belong to both the `renderable` and `partial` types. This means that `posts` can be used as partials, and they will be "findable" on the cache by the render methods. Renderable templates also get their own render methods, but more on that later.
2. `section` will belong to the `layout` type. This means that any `section` template can be used as a layout for other templates.
2. `include` will belong to the `partial` type. This means that any `include` template can be used as partial by other templates.


## Custom loaders

Every template subtype uses a built-in loader to load and/or resolve templates. However, if you need something different, just add your own.

Pass an array of functions, each can take any arguments, but the last must pass an object to the callback:

```js
template.create('component', { isPartial: true },
  function (filepath, next) {
    var str = fs.readFileSync(filepath, 'utf8');
    var file = {};
    file[filepath] = {path: filepath, content: str};
    return file;
  }
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
template.component('components/navbar.html',
  function(file, next) {
    file.data = {foo: 'bar'};
    return file;
  }
);
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

## Build docs

Install devDependencies:

```js
npm i -d && verb
```

## Run tests

Install devDependencies:

```js
npm i -d && verb test
```


TBC...

## Authors
 
**Jon Schlinkert**
 
+ [github/jonschlinkert](https://github.com/jonschlinkert)
+ [twitter/jonschlinkert](http://twitter.com/jonschlinkert) 
 
**Brian Woodward**
 
+ [github/doowb](https://github.com/doowb)
+ [twitter/doowb](http://twitter.com/doowb) 



## License
Copyright (c) 2014 Jon Schlinkert  
Released under the CC by 3.0, MIT licenses

***

_This file was generated by [verb](https://github.com/assemble/verb) on December 16, 2014._


[engine-cache]: https://github.com/jonschlinkert/engine-cache
[engine-noop]: https://github.com/jonschlinkert/engine-noop
[parse-files]: https://github.com/jonschlinkert/parse-files
[parser-cache]: https://github.com/jonschlinkert/parser-cache
[parser-front-matter]: https://github.com/jonschlinkert/parser-front-matter
[parser-noop]: https://github.com/jonschlinkert/parser-noop
