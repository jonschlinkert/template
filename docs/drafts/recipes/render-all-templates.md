# How to render all templates

> This recipe shows how to render all templates of a given `type`, `subtype`, or any templates on the cache.

Before reading on, it might help to freshen up on [template types](./docs/template-types).

...

## Subtypes

If you know what kind of te

```js
var app = new Template();
app.type.renderable.forEach(function (type) {
  var templates = app.cache[type];
  console.log(templates);
});
```