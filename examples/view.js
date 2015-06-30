'use strict';

var App = require('..');
var app = new App();

app.engine('*', require('engine-lodash'));

/**
 * Create
 */
app.create('page', { loaderType: 'sync' });

/**
 * Load
 */
app.pages('a', {path: 'a', content: 'aaa...'});
app.pages('b', {path: 'b', content: 'bbb...'});
app.pages('c', {path: 'c', content: 'ccc...'});
app.pages('d', {path: 'd', content: 'ddd...'})
  .use(function (views, options) {
    // console.log(arguments)
  })

var page = app.pages.get('d')
  .use(function (view) {
    console.log('view:', view)
  })
  .render(function (err, view) {
    console.log('render:', view)
  })

console.log('page:', page);
console.log('------');

var a = app.pages.get('d').clone()
console.log('page:', a);

// rendering snippet
app.asyncHelper('snippet', function (key, options, cb) {
  app.pages.get(key)
    .use(function (view) {
      app.render(trim(view.content), view.data, cb);
    });
});


app.posts('src/*.md'); // 2015-JUN-29-something.md
app.indices('posts', options); // 2015.html, 2015/JUN.html
app.preRender(':year.html', middleware(options));
app.preRender(':year/:month.html', fn);

var pagination = app.pages.get('*.xml')
  .paginate(function (view) {
    console.log('view:', view)
  })

var pagination = app.pages.paginate(function (view) {
  console.log('view:', view)
})

var pagination = app.paginate('pages', function (view) {
  console.log('view:', view)
});
