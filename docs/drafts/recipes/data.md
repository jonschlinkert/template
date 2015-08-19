# .data

> load data to pass as context to templates at runtime


**Example**

```js
template.data({title: 'Blog'});
```

For more complex data needs, like working with i18n data, you can pass a function on the _namespace_ option to customize whatever you want:

```js
assemble.option('namespace', function(filepath, options) {

});
```
