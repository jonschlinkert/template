# Template subtypes

> So, what happens when a subtype is created?

**Magical things**

Two methods are created specifically for your new template subtype: `render` and `get`. Methods names are created from the name of your template, plus the method name.

For example, say you create a new template subtype, `post`, the following methods will be created:

- `.renderPost()`: This async method takes the same parameters as render accept that the first parameter is the `name` of the post to render, and template lookups are faster since the method will look specifically for a `post` on the cache, rather than looking across all `renderable` subtypes.
- `.getPost()`: Method for getting a `post` by name from the cache.

**Examples**

```js
var home = template.getPost('home.md');
//=> {data: {}, locals: {}, content: 'This is the home page!', ...}
```
And for rendering:

```js
template.renderPost('foo.md', function(err, content) {
  // do stuff with err and content.
});
```

If the `plural` form of your new subtype is weird, you can pass it as a second arg before the options.
