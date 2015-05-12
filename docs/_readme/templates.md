
### Define a template

```js
template.page('home.tmpl', 'This home page.');

// add locals
template.page('home.tmpl', 'The <%= title %> page', {title: 'home'});
```

See other [valid formats].

### Render a template

```js
template.render('home.tmpl', function(err, res) {
  //=> 'a xyz b'
});
```

### Render a template

Using the default Lo-Dash engine:

```js
template.render('home.tmpl', function(err, html) {
  if (err) throw err;
  console.log(html); //=> 'The home page.'
});
```

Or you can pass a string (non-cached template):

```js
template.render('foo bar', function(err, html) {
  if (err) throw err;
  console.log(html); //=> 'foo bar'
});
```

**Locals**

Pass `locals` as the second parameter:

```js
template.render('foo <%= bar %>', {bar: 'baz'}, function(err, html) {
  if (err) throw err;
  console.log(html); //=> 'foo baz'
});
```


## Load templates

As glob patterns:

```js
template.pages('pages/*.hbs');
template.pages(['partials/*.hbs', 'includes/*.hbs']);
```

As key/value pairs:

```js
template.page('home', 'This is home.');
template.page('home', 'This is <%= title %>.', {title: 'home'});
template.page('home', {content: 'This is home.'});
template.page('home', {content: 'This is <%= title %>.', title: 'home'});
template.page('home', {content: 'This is <%= title %>.'}, {title: 'home'});
```

_Note any of the above examples will work with either the singular or plural methods (e.g. page/pages)_

## Custom templates

Built-in template types are:

 - `page`: the default `renderable` template type
 - `layout`: the default `layout` template type
 - `partial`: the default `partial` template type

If you need something different, add your own:

```js
template.create('post', { isRenderable: true, isPartial: true });
template.create('section', { isLayout: true });
template.create('include', { isPartial: true });
```

Setting `isRenderable`, `isLayout` and `isPartial` will add special convenience methods to the new template type. For example, when `isRenderable` is true, any templates registered for that that type can be rendered directly by passing the name of a template to the `.render()` method.

**Loading custom templates**

We can now load posts using the `.post()` or `.posts()` methods, the same way that pages or other [default templates are loaded](#load-templates):

```js
template.posts('my-blog-post', 'This is content...');
```

_Note: if you create a new template type with a weird plural form, like `cactus`, you can pass `cacti` as a second arg. e.g. `template.create('cactus', 'cactii')`_


1. `post` will belong to both the `renderable` and `partial` types. This means that `posts` can be used as partials, and they will be "findable" on the cache by the render methods. Renderable templates also get their own render methods, but more on that later.
2. `section` will belong to the `layout` type. This means that any `section` template can be used as a layout for other templates.
2. `include` will belong to the `partial` type. This means that any `include` template can be used as partial by other templates.


## Custom loaders

Every template subtype uses a built-in loader to load and/or resolve templates. However, if you need something different, just add your own.

Pass an array of functions, each can take any arguments, but the last must pass an object to the callback:

```js
template.create('component', { isPartial: true }, [
  function (filepath, next) {
    var str = fs.readFileSync(filepath, 'utf8');
    var file = {};
    file[filepath] = {path: filepath, content: str};
    return file;
  }]
);
```

Now, every `component` will use this loader.

```js
template.component('components/navbar.html');
//=> {'components/navbar.html': {path: 'components/navbar.html', content: '...'}};
```

### Template-specific loaders

When the last argument passed to a template is an array, or more specifically an array of functions, that array will be concatenated to the loader array for the template's subtype.

**Example**

```js
template.component('components/navbar.html', [
  function(file) {
    file.data = file.data || {foo: 'bar'};
    return file;
  },
  function(file) {
    file.opts = file.opts || {baz: 'quux'};
    return file;
  }]
});
//=> {navbar: {path: 'components/navbar.html', content: '...', data: {foo: 'bar'}}};
```

### Loader requirements

As mentioned in the previous section, loader functions may take any arguments long as the last function returns a _valid template object_.

**Valid template object**

A valid template object is a key/value pair that looks like this:

```js
// {key: value}
{'foo.txt': {content: 'this is content'}};
```

- `key` **{String}**: the unique identifier for the template. Usually a name or the filepath that was used for loading the template
- `value` **{Object}**: the actual template object, `value` must have the following properties:
    * `content` **{String}**: the string to be rendered

Any additional properties may be added. Useful ones are:

 - `path` **{String}**: If present, can be used to determine engines, delimiters, etc.
 - `ext` **{String}**: Like `path`, can be used to determine engines, delimiters, etc.
 - `options` **{Object}**: If present, options are passed to engines, and can also be useful in determining engines, delimiters, etc.
 - `locals` **{Object}**: data to pass to templates

