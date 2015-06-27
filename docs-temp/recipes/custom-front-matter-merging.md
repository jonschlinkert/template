## Custom front matter merging

> Example of how to ensure that front-matter "wins" over other data

By default, front matter data is already exposed on the context so it can be used by templates, but the `locals` object takes precedence over front-matter. 

If you'd like for front matter to "win", here are some examples of how to achieve that for different use cases.

## Custom template types

Here's an example of how to ensure that front matter overrides locals in a custom template type. Specifically, we're going to create a custom template type that can be used as partials in other templates. 

**Create a custom template type**

```js
template.create('include', {isPartial: true});
```

- we can now use the `template.include()` and `template.includes()` methods for loading includes
- a special `include` helper was created automatically, but we're going to override it by registering a new one


**Register an async helper**

```js
var _ = require('lodash');

template.asyncHelper('include', function (name, locals, cb) {
  var file = template.getInclude(name);
  locals = _.extend({}, locals, file.data);

  file.render(locals, function (err, content) {
    if (err) return cb(err);
    // do stuff to post-rendered content
    cb(null, content);
  });
});
```

**Register some templates**

Define an include, say `button.html`:

```js
template.include('button.html', {content: '---\ntext: Click me!\n---\n<%= text %>'});
```

Now, let's register a page, where we can use the include defined above:

```js
template.page('home.html', {
  content: '---\ntext: Click something else!\n---\n<%= include("button.html", {text: "Click something"}) %>'
});
```

**Render the templates!**

```js
// register an engine to do the rendering
template.engine('.html', require('engine-lodash'));

template.render('home.html', function (err, content) {
  if (err) console.log(err);
  console.log(content)
});
```

## Complete example

```js
var Template = require('template');
var template = new Template();
var _ = require('lodash');

// register an engine
template.engine('.md', require('engine-lodash'));

// create a custom template type
template.create('include');

/**
 * Custom helper:
 * - override the default `include` helper
 * - extend front matter over locals 
 */

template.asyncHelper('include', function (name, locals, cb) {
  var file = template.getInclude(name);
  locals = _.extend({}, locals, file.data);

  file.render(locals, function (err, content) {
    if (err) return cb(err);
    // do stuff to post-rendered content
    cb(null, content);
  });
});

/**
 * Register some templates:
 *   - the `include` template is loaded onto `template.views.includes`
 *   - the `page` template is loaded onto `template.views.pages`
 */

template.include('button.md', {content: '---\ntext: Click me!\n---\n<%= text %>'});
template.page('home.md', {
  content: '---\ntext: Click something else!\n---\n<%= include("button.md", {text: "Click something"}) %>'
});

/**
 * Render!
 */

template.render('home.md', function (err, content) {
  console.log(content)
});
```
