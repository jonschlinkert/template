# Helpers

## .helper

Register generic template helpers that can be used with any engine.

Helpers registered using this method will be passed to every engine, so this method is best for generic javascript functions.

```js
template.helper('lower', function(str) {
  return str.toLowerCase();
});
```

## .helpers

Register multiple sync helpers.

```js
template.asyncHelpers({
  a: function() {},
  b: function() {},
  c: function() {},
});
```

## async


### .asyncHelper

Register generic async template helpers that are not specific to an engine.

As with the sync version, helpers registered using this method will be passed to every engine, so this method is best for generic javascript functions.

```js
template.asyncHelper('lower', function(str, next) {
  str = str.toLowerCase();
  next();
});
```

### .asyncHelpers

Register multiple async helpers.

```js
template.asyncHelpers({
  a: function() {},
  b: function() {},
  c: function() {},
});
```

## engine-specific

### .engineHelpers

Register an object of helpers that should only be passed to the the given `engine`.

```js
app.engineHelpers('hbs', '*.js');
// or
app.engineHelpers('hbs', {
  foo: function() {},
  bar: function() {},
  baz: function() {},
});
```