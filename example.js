
var path = require('path');
var Template = require('./');
var template = new Template();
template.type('renderable');
template.type('layout');
template.type('partial');

/**
 * Create custom template types
 */

template.create('include', {type: 'renderable'});
template.create('block', {type: 'layout'}, function (name, value) {
  var res = {};
  res[name] = value;
  return res;
});

template.create('stream', {type: 'renderable', loaderType: 'stream'});

template.registerLoader('name', function (obj) {
  obj.name = path.basename(obj.path, path.extname(obj.path));
  return obj;
});

template.registerLoader('obj', function (obj) {
  var results = {};
  results[obj.name] = obj;
  return results;
});

/**
 * Load templates
 */

template.include('button.html', {content: '---\ntext: Click me!\n---\n<%= text %>'})
        .include('sidebar.html', {content: '---\ntext: Expand me!\n---\n<%= text %>'});

var blocks = template.block('name', {path: 'foo.hbs', content: 'This is a block'}, ['obj']);

console.log();
console.log('includes', template.views.includes);

console.log();
console.log('blocks', template.views.blocks);

template.stream(['test/fixtures/layouts/matter/*.md'])
  .on('data', console.log)
  .on('error', console.error)
  .on('end', console.log.bind(console, 'done'));
