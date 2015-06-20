
var fs = require('fs');
var async = require('async');
var path = require('path');
var glob = require('glob');
var File = require('vinyl');
var through = require('through2');
var Template = require('./');
var app = new Template();

app.engine('hbs', require('engine-handlebars'));
app.enable('frontMatter');

var mm = require('micromatch');

app.create('post');

app.post('a', {content: 'this is A...'});
app.post('b', {content: 'this is B...'});
app.post('c', {content: 'this is C...'});

app.asyncHelper('post', function (name, options, cb) {
  var file = this.app.views.posts[name];
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  file.render(this.context, function (err, content) {
    if (err) return cb(err);
    console.log(content);
    return cb(null, content);
  });
});

app.asyncHelper('posts', function(options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  var ctx = this.context;
  var view = this.app.views.posts;
  var keys = Object.keys(view);

  async.map(keys, function (key, next) {
    view[key].render(ctx, function (err, content) {
      if (err) return next(err);
      next(null, content);
    });
  }, function (err, res) {
    if (err) return cb(err);
    console.log(res)
    cb(null, res.join('\n'));
  });
});

// app.asyncHelper('posts', function(options, cb) {
//   if (typeof options === 'function') {
//     cb = options;
//     options = {};
//   }
//   var ctx = this.context;
//   var view = this.app.views.posts;
//   var keys = Object.keys(view);

//   async.map(keys, function (key, next) {
//     view[key].render(ctx, function (err, content) {
//       if (err) return next(err);
//       next(null, content);
//     });
//   }, function (err, res) {
//     if (err) return cb(err);
//     console.log(res)
//     cb(null, res.join('\n'));
//   });
// });

// app.asyncHelper('foo', function (name, locals, cb) {
//   if (typeof locals === 'function') {
//     cb = locals;
//     locals = {};
//   }

//   var ctx = extend({}, this.context, locals);
//   var file = this.app.views.pages[name];

//   file.render(ctx, function (err, content) {
//     if (err) return cb(err);
//     cb(null, content);
//   });
// });

// app.asyncHelper('views', function(collection, pattern, locals, cb) {
//   if (typeof locals === 'function') {
//     cb = locals;
//     locals = {};
//   }

//   var ctx = extend({}, this.context, locals);
//   var view = this.app.views[collection];
//   var keys = mm(Object.keys(view), pattern);

//   async.map(keys, function (key, next) {
//     var file = view[key];
//     file.render(ctx, function (err, content) {
//       if (err) return next(err);
//       next(null, content);
//     });
//   }, function (err, res) {
//     if (err) return cb(err);
//     cb(null, res.join('\n'));
//   });
// });


app.helper('pages', function (pattern, context, options) {
  if (typeof pattern !== 'string') {
    context = pattern;
    pattern = '*';
  }

  context = context || {};
  var keys = Object.keys(this.app.views.pages);


});

/**
 * sync
 */

// sync loaders
app.loader('glob', function(pattern) {
  return glob.sync(pattern);
});

app.loader('read', function(files) {
  return files.reduce(function (acc, fp) {
    var str = fs.readFileSync(fp, 'utf8');
    var name = path.basename(fp);
    acc[name] = {path: fp, content: str};
    return acc;
  }, {});
});

// create a view collection
app.create('page', { viewType: 'renderable' }, ['glob', 'read']);

// define sync plugins
function one(options) {
  return function(views) {
  console.log(this)
    // console.log('one:', views)
    return views;
  }
}

function two() {
  return function(views) {
    // console.log('two:', views)
    return views;
  }
}

var pages = app.pages('test/fixtures/*.hbs')
  // .use(function (views) {
  //   console.log('this:', this);
  // })
  // .use(function (views) {
  //   console.log('views:', views);
  // })
  .use(function (views) {
    console.log('get:', this.get('c.hbs'));
  })

// console.log(pages);


// for (var key in pages) {
//   if (pages.hasOwnProperty(key)) {
//     app.render(pages[key], function (err, res) {
//       // console.log(res);
//     });
//   }
// }

// console.log(app.views)
