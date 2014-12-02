
## Helpers

### Example helper

> Example helper for adding **includes** to other templates


```js
template.helper('include', function include(name, locals) {
  // `this`
  var app = this.app;

  // `template.option()`
  var opts = this.options;

  // `template.include()`
  var includes = this.views.includes;

  // runtime context returned from the `mergeContext` function
  var ctx = this.context;

  // get the include to render
  var template = includes[name];
  //=> {'foo.md': {path: 'includes/foo.md', content: '...', data: {...}}}

  app.render(template, locals, function(err, content) {
    // do stuff with content
  });
});
```

