# Context

## Places where data might be passed


- `app.cache.data`: "global" data
- `render locals`: passed to the render method
- `helper locals`: passed to a helper. example `<%= include("abc.md", {title: "home"}) %>`
- `view.data`: front matter
- `view.locals`: "loader" locals, like `app.page('foo', {content: '', locals: {}})`



## Customizing context merging

### .context method


### options.mergeContext

Pass a custom function for merging context before rendering.

```js
app.option('mergeContext', function(locals) {
  return extend(this.data, this.locals, locals);
});
```
