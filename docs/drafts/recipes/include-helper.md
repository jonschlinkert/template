# Creating "include" helpers

> Define helpers for including templates from specific collections, or any collection.

## Steps

1. 



**Example**

Example helper for adding **includes** to other templates

```js
app.helper('include', function(name, locals, cb) {
  var view = app.includes.get(name);

  view.render(locals, function(err, res) {
    if (err) return cb(err);
    cb(null, res.content);
  });
});
```

**Usage**

Before we can use the helper, we'll have to define an include.

```js
app.include('foo', {content: 'This is content from `foo`...'});
```

Now, we can include the `foo` template in other templates by defining the following:

```js
This is content before `foo`
<%= include('foo') %>
This is content after `foo`
```

**Result**

If all goes well, we should see something like this:

```js
This is content before `foo`
This is content from `foo`...
This is content after `foo`
```

