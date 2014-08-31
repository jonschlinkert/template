```js
// Default stack
template.parser(require('parser-front-matter'));

// Associated with `.hbs` file extension
template.parser('hbs', require('parser-front-matter'));
```

See [parser-cache] for the full range of options and documentation.
