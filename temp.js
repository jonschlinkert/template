'uses strict';

var Template = require('./');
var template = new Template();
var globber = require('./test/lib/globber');
var _ = require('lodash');

template.transform('username', function (app) {
  app.cache.data.username = 'jonschlinkert';
  console.log(app.cache);
});

template.create('doc', { isRenderable: true }, [
  function (file, next) {
    next(null, file);
  }
]);

template.create('post', { isRenderable: true }, [
  function (patterns, next) {
    var files = globber(patterns);
    var fn = arguments[arguments.length - 1];
    fn(null, files);
  }
]);

template.create('doc', { isRenderable: true });
template.layout('default', {content: '<section>{% body %}</section>'});
template.page('abc', {content: 'this is content', layout: 'default', locals: {a: 'b'}, options: {foo: 'bar'}});

template.posts('test/fixtures/layouts/matter/*.md');
template.create('foo', { isRenderable: true }, [
  function (patterns, next) {
    var files = globber(patterns);
    next(null, files);
  }
]);

template.foos('test/fixtures/layouts/matter/*.md');
template.docs('aaa', {content: 'this is content'});


// console.log(template);
