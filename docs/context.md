# Context

## Places where data might be passed

**global**

- `app.cache.data`: generic "global" data
- `app.cache[name].data`: globally defined data that matches the name of a view

**method locals**

- `.compile()`: locals passed to the `.compile` method 
- `.render()`: locals passed to the `.render` method 

**helpers**

Locals passed to a helper. Examples:

```html
<!-- lodash -->
<%= include("abc.md", {title: "home"}) %>
<!-- or -->
<%= include("abc.md", title) %>

<!-- handlebars -->
{{foo title}}
```

**view properties**

- `view.data`: front matter
- `view.locals`: "loader" locals, like `app.page('foo', {content: '', locals: {}})`
- `view.options`: a view's options may be merged into the context. This is useful for passing options to helpers 



## Customizing context merging

### .context method


### options.mergeContext

Pass a custom function for merging context before rendering.

```js
app.option('mergeContext', function(locals) {
  return extend(this.data, this.locals, locals);
});
```
