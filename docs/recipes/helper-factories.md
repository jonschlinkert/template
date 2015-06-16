# Helper factories

> A factory function for creating helpers that are bound to a view collection, making it easier to get specific views.


```js
function factory(collection) {
  return function(pattern, locals, cb) {
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    var ctx = extend({}, this.context, locals);
    var view = this.app.views[collection];
    var keys = mm(Object.keys(view), pattern);

    async.map(keys, function (key, next) {
      var file = view[key];
      file.render(ctx, function (err, content) {
        if (err) return next(err);
        next(null, content);
      });
    }, function (err, res) {
      if (err) return cb(err);
      cb(null, res.join('\n'));
    });
  };
}

template.asyncHelper('pages', factory('pages'));
```
