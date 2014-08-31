```js
var str = fs.readFileSync('a/b/c.md', 'utf8');
template.parseSync({path: 'a/b/c.md', content: str});
```

Optionally pass an array of parser functions as a section argument.

```js
template.parseSync({path: 'a/b/c.md', content: str}, [a, b, c]);
```

See [parser-cache] for the full range of options and documentation.