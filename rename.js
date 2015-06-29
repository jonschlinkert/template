
var path = require('path');
var App = require('./');

app = new App();
app.engine('tmpl', require('engine-lodash'));

app.create('post', {
  renameKey: function (key) {
    return 'posts/' + path.basename(key);
  }
});
app.posts('test/fixtures/*.txt');
// var posts = app.posts.get();
// console.log(posts)


app.create('page');
app.pages('test/fixtures/*.txt');
// var pages = app.pages.get();
// console.log(pages)


app.create('foo');
app.foos.option('renameKey', function (key) {
  return path.basename(key);
});

app.foos('test/fixtures/*.txt');
// var foos = app.foos.get('a.txt');
// console.log(foos)



app.create('bar');
app.bar.renameKey(function (key) {
  return path.basename(key);
});

app.bars('test/fixtures/*.txt');
var bars = app.bars.get();
console.log(app.bars.renameKey('foo/bar/baz.hbs'))


