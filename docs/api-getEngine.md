```js
var consolidate = require('consolidate')
template.engine('hbs', consolidate.handlebars);
template.getEngine('hbs');
// => {render: [function], renderFile: [function]}
```