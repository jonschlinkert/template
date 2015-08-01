


```js
var del = require('del');
var app = require('app4');

app.task('default', function(done) {
  del('tmp/**', done);
});
```
