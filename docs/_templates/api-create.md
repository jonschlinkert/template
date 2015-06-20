# .create

> **Create custom template types**. Good for building collections of templates that may need [custom loaders](#loaders), [custom engines](#engines), or to be rendered at different times.



**Usage**

```js
app.create(singular, plural, options, callbacks, done);
```

- The signature of the first loader in the array must match (or be able to handle) the arguments that are expected when loading templates.
- Each function can call `next` and pass it's results to the next function.
- The last function must return an object in the form of `{ key: value }`, where `key` is unique to the template type and `value` is the template object.


**Params**

```js
app.create('post', options, [...], function () { ... });
```


**Examples**

```js
app.create('post', 'posts', { isRenderable: true }, [
  function(files, next) {

    next();
  },
  function(files, next) {

    next();
  }
],
// optional error handling
function (err) {
  if (err) return handleError(err);
});
```


**Example**

```js
// not a real thing
var wordpressClient = require('wordpress-client');

// create a new post template type with a custom loader
// that reads posts from a wordpress database based on a start date.
app.create('post', [
  // loader function that takes a startDate
  function (startDate, next) {
    // get the posts from wordpress
    wordpressClient.query({start: startDate}, next);
  },
  // loader function that takes the results from the previous loader
  function (results, next) {
    var posts = {};
    results.forEach(function (post) {
      posts[post.path] = post;
    });
    next(null, results);
  }

// final (optional) function for handling errors from the loaders
], function (err, posts) {
  if (err) return handleError(err);
});

// now use the `post` type to read posts starting with '01-JAN-2014'
// optionally pass a callback function to be notified when loading is complete.
app.posts('01-JAN-2014', function (err) {
  if (err) return handleError(err);
});
```
