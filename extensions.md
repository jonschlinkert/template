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


## Transforms

> Good for extending or modifing the `cache.data` object upon initialization.

Transforms are run immediately during init and are used to extend or modify the `cache.data` object, but really anything on the `this` object can be tranformed.

**Example**

```js
app.transform('username', function(app) {
  var url = app.cache.data.author.url.split('/');
  app.cache.data.username = url[2];
});
```

## Custom templates (subtypes)

> Good for...

When you only specify a name for the type, a plural form is created
automatically (e.g. `page` and `pages`). However, you can define the
`plural` form explicitly if necessary.

**Example**

```js
app.create('post', function() {

});
```

## Loaders

> Good for...

(more detail)

**Example**

```js
app.loader(function() {

});
```

## Engines

> Good for...

(more detail)

**Example**

```js
app.engine('hbs', function() {

});
```

## Helpers

> Good for...

(more detail)

**Example**

```js
app.helper('camelcase', function() {

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
