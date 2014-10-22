## Defining an engine

```js
var template = new Engine();
template.engine(ext, fn, options);
```

* `ext` **{String}** The engine to use for rendering templates.
* `fn` **{Function|Object}**: or `options` Callback function or options to pass to the engine.
* `options` **{Object}** Options to pass to the engine.

**Example:**

```js
template.engine('md', require('engine-handlebars'));
```

### Manual engine selection

You may also override dynamic engine selection by explicitly defining an engine in the following places:

 * `template.create()`: Pass the `engine` when creating a template type
 * `template.page()`: Pass the `engine` when specifying an actual template. Works with built-in template types (e.g. `page`, `partial`, `layout`) or custom types.

**Examples:**

```js
template.create('doc', 'docs', {
  engine: 'lodash',
  renderable: true
});

template.create('post', 'posts', {
  engine: 'handlebars',
  renderable: true
});

// usage
template.doc('about.md', 'this is the <%= title %> page', {title: 'About'});
template.post('post.md', 'this is post is about {{title}}', {title: 'Engine'});
// this works with built-in template types too
template.page('post.md', 'this is post is about {{title}}', {title: 'Engine'});
```