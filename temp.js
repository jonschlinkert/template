'uses strict';

var Template = require('./');
var template = new Template();

template.create('post', { isRenderable: true });
template.create('doc', { isRenderable: true });

template.layout('default', {content: '<section>{% body %}</section>'});
template.page('abc', {content: 'this is content', layout: 'default', locals: {a: 'b'}, options: {foo: 'bar'}});
template.post('xyz', {content: 'this is content'});
template.docs('aaa', {content: 'this is content'});


console.log(template.mergeType('renderable', ['docs', 'posts']));
