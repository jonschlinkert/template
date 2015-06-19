# Collections

## recent items

### Options

- `limit`: determines the number of items to return
- `prop`: the property to sort on. by default either the template key is used, or the `data.date` property if it exists in the front-matter of a view.

### Example

Get the most recent views from a collection.

```js
var posts = template.views.posts;
var recent = posts.recent();
//=> returns the 10 most recent posts
```

