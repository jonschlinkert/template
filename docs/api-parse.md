```js
var str = fs.readFileSync('some-file.md', 'utf8');
template.parse({ext: '.md', content: str}, function (err, file) {
  console.log(file);
});
```

Or, explicitly pass an array of parser functions as a section argument.

```js
template.parse(file, [a, b, c], function (err, file) {
  console.log(file);
});
```
See [parser-cache] for the full range of options and documentation.
