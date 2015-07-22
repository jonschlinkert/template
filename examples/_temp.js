var App = require('..');
var app = new App();

app.create('posts');


app.post('2015-10-01', {content: 'another day...'});


app.posts.get('2015-10-01')
  .defineProp('foo')

var post = app.posts.get('2015-10-01');

// set the value of `foo` on `app`
app.foo = 'fallback'
console.log(post.foo)

// set the value of `foo` on `post`
post.foo = 'abc';
console.log(post.foo)

