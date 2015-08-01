# Getting the most out of Template

> Before you start writing plugins, middleware, helpers or other extensions, to use Template effectively it helps to first know where each succeeds and where they fail.

If you need to extend Template in some way, you have a number of options, each with a very different purpose:

1. [Transforms](#transforms)
1. [Custom templates](#custom-templates-subtypes)
1. [Loaders](#loaders)
1. [Engines](#engines)
1. [Helpers](#helpers)
1. [Routes](#routes)
1. [Middleware](#middleware)
1. [Plugins](#plugins)

This document isn't meant to be comprehensive, just a starting point to get you headed in the right direction. Click on the links below each section to learn more.

## Getting started

Other useful information to help you get started with Template:

 - [the-template-object](#the-template-object)
 - [](#the-template-object)


## .transform

> Good for updating global data and options.

Transforms are executed immediately and passed the current app ([`template`](https://github.com/jonschlinkert/template)) upon initialization so data and options can be updated.

**Example**

```js
// loads package.json data onto `app.cache.data`
app.transform('load-package-data', function(app) {
  app.data('package.json');
});
```

## .create

> Good for building collections of templates that may need [custom loaders](#loaders), [custom engines](#engines), or to be rendered at different times.

**Summary**

 - the `.create()` method is used for creating custom template types, along with any options specifying the [engine](#engines) and/or [loader](#loaders) to use
 - each template type is stored in its own collection

**Creating template types**

For example, let's say you have a special kind of template that you like to refer to as **widgets**. Here is how you would create a template type to handle them:

```js
assemble.create('widget', { isPartial: true });
```

Assemble now recognizes the `widget` (and `widgets`) template type, and has created special methods for loading them:

```js
assemble.widget('foo', {content: "I'm a widget"});
assemble.widgets('templates/*.hbs');
```

Both of the above methods will work with object formatted templates, glob patterns or file paths, and both will load widgets and store them on the `assemble.views.widgets` object.

In addition, since we told Assemble that this template type can be used as partials in the `.create()` method. To load the partials, you would use the automatically created `widget` helper method that assemble created for this template type.

```
{{widget "foo"}}
```

You can of course override the helper method, like this:

```js
assemble.helper('widget', function (name, context) {
  // assemble also creates a special `get` method for widget
  var template = assemble.getWidget(name);

  // `template` is an object with whatever properties you add, but
  // by default templates are normalized to have `path` and `content`
  // properties

  // @doowb's example as async, this is the sync version
  return template.render(context);
});
```

## .create

> Good for building collections of templates that may need [custom loaders](#loaders), [custom engines](#engines), or to be rendered at different times.

**Usage**

 - template types can be created along with options specifying the [engine](#engines) and/or [loader](#loaders) to use
 - each template type is stored in its own collection

**Example**

```js
// signature for creating a custom template type.
// Loaders and callback are described below
app.create('post', options, [...], function () { ... });
```

See the [docs for custom templates](./api-create.md).


## .load

> Good for customizing the arguments and sources of templates being loaded.

**Usage**

Loaders are created by passing an array of one or more functions to the template `.create()` method:

**Example**

```js
app.create('post', [
  function(filepath, next) {
    var str = fs.readFileSync(filepath, 'utf8');
    var name = path.basename(filepath, path.extname(filepath));
    var template = {};
    template[name] = {path: filepath, content: str};
    next(null, template);
  },
  function(template, next) {
    // do more stuff with `template`
    next(null, template);
  }
]);
```


## Engines

> Good for rendering/parsing/building files.

Custom engines can be added and will be run when `render` is called for the matching `ext`

**Example**

```js
app.engine('hbs', function() {
});
```

## Helpers

> Good for doing something inside templates during the render process.

Helpers can be as simple as making a string all uppercase or as complicated as finding and rendering another template. When creating a custom template type, helpers are generated for you that match the name of the template type and render a template of that type when given a name and optional local context.

**Example**

```js
app.helper('upper', function(str) {
  return str.toUpperCase();
});

app.asyncHelper('renderPosts', function (names, locals, callback) {
  // lookup each post
  var posts = names.map(function (name) {
    return app.getPost(name);
  }).filter(Boolean);

  // render all posts and join their contents together
  async.mapSeries(posts, function (post, next) {
    post.render(locals, next);
  }, function (err, results) {
    if (err) return callback(err);
    next(null, results.join('\n'));
  });
});
```

## Routes

> Good for...

(more detail)

**Example**

```js
app.route('', function() {

});
```

## Middleware

> Good for...

(more detail)

**Example**

```js
app.use('', function() {

});
```

## Plugins

> Good for...

(more detail)

**Example**

```js
app.task('default', function() {
  app.src('templates/*.tmpl')
    .pipe(plugin())
    .pipe(app.dest())
});
```