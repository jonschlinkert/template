



```js
var template = new Template();

template.create('page', { isRenderable: true }, [
  function (patterns, cwd, options, next) {
    var files = glob.sync(patterns, options);
    if (files.length === 0) {
      return next(null, null);
    }

    var res = _.reduce(files, function(acc, fp) {
      acc[fp] = {content: fs.readFileSync(fp, 'utf8'), path: fp};
      return acc;
    }, {}, this);

    next(null, res);
  },
  function (file, next) {
    // do stuff
    next(null, file);
  }
], function (err, result) {
   // result now equals 'done'
});

template.pages('foo/*.md' [
  function (file, next) {
    // do stuff wit file
  }
]);
```