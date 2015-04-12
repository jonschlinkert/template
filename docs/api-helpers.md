## Helpers

### Example helper

> Example helper for adding **includes** to other templates



## Helper anatomy

```js
function include(name, locals) {
  // the `template` object is on `this.app`, to avoid 
  // conflicts with values on the `this` object in helpers
  var app = this.app;

  // `template.option()`
  var opts = this.options;

  // `template.include()`
  var includes = this.views.includes;

  // get the include to render
  var template = includes[name];
  //=> {'foo.md': {path: 'includes/foo.md', content: '...', data: {...}}}

  // runtime context returned from the `mergeContext` function
  var ctx = extend(this.context, locals);

  // use the render method
  app.render(template, ctx, function(err, content) {
    // do stuff with content
  });
}

template.helper('include', include);
```

