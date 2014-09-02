**Examples:**

```js
var str = fs.readFileSync('a/b/c.md', 'utf8');
template.parse({path: 'a/b/c.md', content: str}, function (err, file) {
  if (err) console.log(err);
  console.log(file);
});
```

Optionally pass an array of parser functions as a section argument.

```js
template.parse({path: 'a/b/c.md', content: str}, [a, b, c], function (err, file) {
  if (err) console.log(err);
  console.log(file);
});
```

See [parser-cache] for the full range of options and documentation.
