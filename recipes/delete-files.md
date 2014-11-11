


```js
var del = require('del');
var verb = require('verb4');

verb.task('default', function(done) {
  del('tmp/**', done);
});
```
