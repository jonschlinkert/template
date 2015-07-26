# Loaders

> Loaders, one of Template's most powerful features, are functions that may be defined for loading items onto collections. 

A loader's responsibility is to figure out how to take some object, file, or other data and perform any transformations or preparation needed to load that data onto the collection that is using the loader.

## Loader facts

Some tidbits of information to help explain what loaders do:

- Loaders are [registered](#registering-loaders) using the `.loader()` method
- Loaders are JavaScript functions that return whatever value is expected based on how the loader is being used
- Loaders may be defined as async, sync, promise or stream.
- The `loaderType` option must be specified if any type other than `sync` is used.
- Loaders can be used completely standalone [used standalone][loader-cache], or as components of other loaders
- Template uses default loaders to add items to collections. For example, if you define a view collection, `app.create('pages')`, then use `app.pages('foo/*.md')`, the `app.pages()` method would use Template's built-in loaders to load views onto the `app.views.pages` object.
- A custom loader or loaders may be passed to the `.create()` method to override Template's default loaders for a [view collection](view-colections.md) (e.g. `.pages()`)
- When a custom loader stack is defined for a [view collection](view-colections.md), views will be loaded onto the collection using the custom loader stack.
- Loaders can be stacked like building blocks to create more sophisticated loaders
- Loaders can work with the file system, fetch data from a remote API, or do anything else you can conjure up - as long as the last loader in the "stack" returns the object expected by the collection.

## Defining loaders

Example of a basic loader for reading files.

```js
app.loader('read', function(fp) {
  return fs.readFileSync(fp, 'utf8');
});
```

### View collection loaders

It's important to note that _view collection loaders have a different signature than other loaders!_. 

View collection loaders are wrapped with a function that exposes the `collection` and collection `options`. 

**Params**

- `collection`: view collection loaders expose a `collection` parameter, which is the "current collection" for which the collection is being used. 
- `options` view collection loaders expose an `options` parameter, which will have any options that were specifically defined for that collection (typically passed on the `.create()` method) 

**Example view collection loaders**

```js
var glob = require('glob');

// `glob` loader, can be used with other loaders
app.loader('glob', function (views, options) {
  return function (patterns, opts) {
    return glob.sync(patterns, opts);
  };
});

// `globFiles` loader, depends on the `glob` loader 
app.loader('globFiles', ['glob'], function (views, options) {
  return function (files) {
    return files.reduce(function (acc, fp) {
      var file = {content: fs.readFileSync(fp, 'utf8'), path: fp};
      // `views` is the accumulator, so `acc` is the views collection
      // this means we can use the collection's `set` method to add 
      // the item to the collection.
      return acc.set(fp, file);
    }, views);
  };
});

// Create a custom views collection, `posts`, passing the `globFiles` 
// "loader stack" for loading posts
app.create('post', ['globFiles']);

// now, anytime we use `app.posts()` the `globFiles` loader 
// stack will be called
app.posts('src/blog/posts/*.md');
```


## Loader tips

Loaders can return any value, and receive any value. However, it's important that you "stack" your loaders properly so that each loader passes the kind of value expected by the next loader in the stack.

```js
app.loader('read', function(fp) {
  return fs.readFileSync(fp, 'utf8');
});

// tbc...
```


## Composing loaders

_(TODO: this should explain best practices for composing loaders)_

```js
app.loader('read', function(collection) {
  return function(fp) {
    return fs.readFileSync(fp, 'utf8');
  };
});
```



{%= reflinks(['loader-cache']) %}