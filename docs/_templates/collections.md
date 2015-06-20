# Collections


A template collection is created using the `.create()` method, and its templates are stored on the `template.views.*` object. By way of example, Assemble's built-in templates, `.page()`, `.layout()` and `.partial()` are each create created using the create method,


## API

## .filter


### function

**Example**

Pass a custom filter function to get posts that have `2014` or `2015` in the filepath:

```js
var filtered = app.posts.filter('path', function (fp) {
  return mm.isMatch(fp, '/**/201[45]-*');
});
```

## .recent

### Options

- `limit`: determines the number of items to return
- `prop`: the property to sort on. by default either the template key is used, or the `data.date` property if it exists in the front-matter of a view.


**Example**

Get the most recent views from a collection.

```js
var posts = template.views.posts;
var recent = posts.recent();
//=> returns the 10 most recent posts
```

