# views collection

> A "view collection" is a specific kind of collection in Template. If you're not familiar with Template's [Collection](./collections.md) class, it might help to start there befor diving into view-collections.


## Overview

- a "view collection" is a collection created using `app.create()`
- `app.create()` creates an instance of `Views` for each view collection.
- view-collections are stored on `app.views`. So "pages" would be stored on `app.views.pages`, and "posts" would be stored on `app.views.posts`, and so on.


## Example usage

To create a new view collection:

```js
var pages = new App.Views();
```


## Inflections

Inflection is auto-detected when a view collection is created using the `.create()` method.

**Example**

Either of the following will create a `posts` collection:

```js
app.create('post');
app.create('posts');
```

**Result**

Now that the `posts` collection has been created, either of the following "loader" methods can be used to load posts onto the `app.views.posts` object:

```js
app.post('posts/*.md')
app.posts('posts/*.md');
```

