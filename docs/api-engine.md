**Example:**

```js
var consolidate = require('consolidate')
template.engine('hbs', consolidate.handlebars);
template.engines('hbs');
// => {render: [function], renderFile: [function]}
```

See [engine-cache] for details and documentation.