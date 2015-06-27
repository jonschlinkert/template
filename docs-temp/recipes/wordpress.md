# WordPress

```js
// not a real thing
var wordPressClient = require('wordpress-client');

// create a new post template type with a custom loader
// that reads posts from a wordpress database based on a start date.
app.create('post', [
  // loader function that takes a startDate
  function (startDate, next) {
    // get the posts from wordpress
    wordPressClient.query({start: startDate}, next);
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
