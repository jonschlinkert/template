'uses strict';

var Template = require('./');
var template = new Template();
var globber = require('./test/lib/globber');


template.create('post', { isRenderable: true }, [
  function (key, value, next) {
    this.cache.posts[key] = value;
    next(null)
  }
]);

template.create('doc', { isRenderable: true }, [
  function (key, value, next) {
    this.cache.docs[key] = value;
  }
]);

template.layout('default', {content: '<section>{% body %}</section>'});
template.page('abc', {content: 'this is content', layout: 'default', locals: {a: 'b'}, options: {foo: 'bar'}});
template.post('xyz', {content: 'this is content'});
template.docs('aaa', {content: 'this is content'});

console.log(template)
console.log(template.mergeType('renderable', ['docs', 'posts']));
