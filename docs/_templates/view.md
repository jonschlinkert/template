# View

> A template represents a single view. 

## The facts

- Views are objects
- Views are stored `template collections
- Every template has properties



## View API

- `.set`
- `.get`
- `.recent`
- `.related`

## .set
## .get

## .context

Build the context object for a single view.

```js
var ctx = view.context();
```

Extend the context object for a single view.

```js
var ctx = view.context({foo: 'bar'});
```

Pass a custom function for modifying the context.

```js
// return data only
var ctx = view.context(function (data, locals) {
  return data;
});

// return locals only
var ctx = view.context(function (data, locals) {
  return locals;
});

// extend however you want
var ctx = view.context(function (data, locals) {
  return extend({foo: 'bar'}, locals, data);
});
```

**Example**

Use a view's `get` method as a handlebars subexpression:

```handlebars
{{#views 'posts'}}
  {{log (get "data.title")}}
{{/views}}
```

## .recent

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

