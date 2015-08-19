
## Register an engine

Register

**Examples**

```js
// use handlebars to render templates with the `.hbs` extension
template.engine('hbs', require('engine-handlebars'));

// use lo-dash to render templates with the `.tmpl` extension
template.engine('tmpl', require('engine-lodash'));
```

**Using consolidate.js**

You can also use consolidate:

```js
var consolidate = require('consolidate');
template.engine('hbs', consolidate.handlebars);
template.engine('tmpl', consolidate.lodash);
```

**Using a custom function**

Example of creating an engine to render `.less` files:

```js
var less = require('less');

template.engine('less', function(str, options, cb) {
  less.render(str, options, function (err, res) {
    if (err) { return cb(err); }
    cb(null, res.css);
  });
});
```

You can also use [engine-less](https://github.com/jonschlinkert/engine-less).
