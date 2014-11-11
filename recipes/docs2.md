
```js
// define engines
template.engine('hbs', require('engine-handlebars'));
template.engine('dotfile', function(err, content) {

});

// add some templates
template.pages('pages/*.hbs');

// create a custom template type

template.pages('pages/*.hbs');
```


Now start creating!

```js
template.layout('default', 'abc {% body %} xyz');
template.page('home', 'Welcome!', {layout: 'default'});

template.render('home', function(err, content) {
  console.log(content);
  //=> 'abc Welcome! xyz'
});
```

## Engines

Define a [consolidate](https://github.com/tj/consolidate.js)-compatible template engine:

```js
template.engine('hbs', require('engine-handlebars'));
template.engine('md', require('engine-lodash'));
```

## Custom template types

Subtypes belong to one of the three **types**: `renderable`, `layout` or `partial`.

```js
// `post` is now subtype of `renderable`
template.create('post', { isRenderable: true });

// We can now add `posts` using the `.post()` or `.posts()` method
template.post('home.md', { content: 'Innovate faster than you ever could have imagined!' });
template.post('about.md', { content: 'Create originally as a framework to...' });
```

## Engines

Render templates with any any engine.

