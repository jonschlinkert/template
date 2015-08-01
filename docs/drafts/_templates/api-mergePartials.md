# .mergePartials

By default, all `partial` collections are merged onto a single `partials` object. To keep each collection on a separate object, you can do `template.disable('mergePartials')`.

If you want to control how partials are merged, you can also pass a function to the `mergePartials` option:

**Example**

```js
template.option('mergePartials', function(locals) {
  // do stuff
});
```