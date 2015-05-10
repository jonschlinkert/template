# Working with helpers

> Learn how to register and author helpers to be used in your templates

## Table of contents

<!-- toc -->

## Need to know

- Template offers support for sync and async helpers, regardless of the template engine
- sync helpers are stored on `template._.helpers`
- async helpers are stored on `template._.asyncHelpers`
- helpers are registered using the `template.helper()` and `template.helpers()` methods
- async helpers are registered using the `template.asyncHelper()` and `template.asyncHelpers()` methods

## Register sync helpers

Register helpers that may be used with any template engine:

**Example**

```js
template.helper('lowercase', function(str) {
  return str.toLowerCase();
});
```

**Pro tips**

- make your helpers as generic as possible 
- If you want to publish your helpers, see the first bullet
- If you want to use your helpers with any template engine, see the first bullet


## Register async helpers

Register async helpers that may be used with any template engine:

**Example**

```js
template.asyncHelper('lowercase', function(str, cb) {
  cb(null, str.toLowerCase());
});
```

**Example with rendering**

```js
template.asyncHelper('include', function(name, locals, cb) {
  var obj = template.getInclude(name);

  template.render(obj, locals, function (err, content) {
    if (err) {
      return cb(err);
    }
    // do stuff to post-rendered content
    return cb(null, content);
  });
});
```

**Pro tips**

- make your helpers as generic as possible 
- If you want to publish your helpers, see the first bullet
- If you want to use your helpers with any template engine, see the first bullet


## Engine-specific helpers

Register helpers directly with an engine.


```js
template.engine('hbs', consolidate.handlebars);
var engine = template.getEngine('hbs');

// engine-specific helper methods are named differently to disambiguate
engine.helpers.addHelper('lowercase', function(str) {
  return str.toLowerCase();
});
```
