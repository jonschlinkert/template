
var fs = require('fs');
var path = require('path');
var through = require('through2');
var Template = require('./');
var template = new Template();
var glob = require('glob');


template.loader('base', {type: 'async'}, function baseAsync(key, value, next) {
  setTimeout(function () {
    var results = {};
    results[key] = value;
    next(null, results);
  }, 300);
});

template.loader('base', {type: 'stream'}, function baseStream(key, value) {
  var stream = through.obj();
  var results = {};
  results[key] = value;
  stream.write(results);
  return stream;
});

template.loader('base', function baseSync(pattern) {
  return pattern;
});

template.loader('glob', function glob_(pattern) {
  return glob.sync(pattern);
});

template.loader('read', function read_(files) {
  return files.reduce(function (acc, fp) {
    var str = fs.readFileSync(fp, 'utf8');
    var name = path.basename(fp);
    acc[name] = {path: fp, content: str};
    return acc;
  }, {});
});


template.create('page', ['base']);
template.create('include', {viewType: 'partial'}, ['base']);
// template.pages({ loaderType: 'async' })
//   .src('home', {content: 'this is content...'}, function (err, views) {
//     if (err) console.error(err);
//     console.log('callback', views);
//   })
//   .use(function () {
//     console.log('use', template.views.pages);
//   })


template.page('home', {content: 'this is content...'}, { loaderType: 'stream' })
  .on('error', console.error)
  .pipe(through.obj(function(obj, enc, next) {
    console.log(obj)
    this.push(obj);
    next();
  }, function (cb) {
    // console.log('flush', template.views.posts);
    cb();
  }))
  .on('error', console.error)
  .on('data', function () {
     // console.log('done', template.views.posts)
  });


// template.pages({}, ['foo', 'bar']).src('abc/*.hbs')
//   .pipe(one())
//   .pipe(two())
//   .pipe(template.pages.dest())

function one(options) {
  return function(pattern) {
    // console.log('one:', pattern)
    return pattern;
  }
}

function two() {
  return function(pattern) {
    // console.log('two:', pattern)
    return pattern;
  }
}

template.pages('test/fixtures/*.txt', {loaderType: 'sync'}, {}, ['glob', 'read'])
  // .src('test/fixtures/*.txt')
  .use(one())
  .use(two())
  // .use(template.pages.done())

console.log('template.views.pages:', template.views.pages)
