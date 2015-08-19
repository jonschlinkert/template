var App = require('..');
var app = new App();

app.data({title: 'Blog'});
console.log(app.cache.data);
//=> {title: 'Blog'}


app.data('test/fixtures/data/*.json');
console.log(app.cache.data);
//=> {title: 'Blog'}
