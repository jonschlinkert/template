
var Template = require('./');
var through = require('through2');
var template = new Template();
var glob = require('glob');
var fs = require('fs');


template.loader('base', {type: 'async'}, function (key, value, next) {
  setTimeout(function () {
    var results = {};
    results[key] = value;
    next(null, results);
  }, 300);
});

template.loader('base', {type: 'stream'}, function (key, value) {
  var stream = through.obj();
  var results = {};
  results[key] = value;
  stream.write(results);
  return stream;
});

template.loader('glob', function(pattern) {
  console.log('glob', pattern);
  return glob.sync(pattern);
});

template.loader('read', function(files) {
  console.log('read', files);
  return files.reduce(function (acc, fp) {
    var str = fs.readFileSync(fp, 'utf8');
    acc[fp] = {path: fp, content: str};
    return acc;
  }, {});
});


template.create('page');
template.create('include', {viewType: 'partial'}, ['base']);
// template.pages({ loaderType: 'async' })
//   .src('home', {content: 'this is content...'}, function (err, views) {
//     if (err) console.error(err);
//     console.log('callback', views);
//   })
//   .use(function () {
//     console.log('use', template.views.pages);
//   })


template.pages({ loaderType: 'stream' })
  .src('home', {content: 'this is content...'})
  .on('error', console.error)
  // .on('data', console.log)
  .pipe(through.obj(function(obj, enc, next) {
    console.log('through', obj);
    this.push(obj);
    next();
  }, function (cb) {
    console.log('flush', template.views.pages);
    cb();
  }))
  .on('error', console.error)
  // .on('data', console.log);

// console.log(template.views)

// template.pages({}, ['foo', 'bar']).src('abc/*.hbs')
//   .pipe(one())
//   .pipe(two())
//   .pipe(template.pages.dest())

function one(options) {
  return function(pattern) {
    console.log('one:', pattern)
    return pattern;
  }
}

function two() {
  return function(pattern) {
    console.log('two:', pattern)
    return pattern;
  }
}

template.pages({loaderType: 'sync'}, ['glob', 'read'])
  .src('test/fixtures/*.txt')
  .use(one())
  .use(two())
  // .use(template.pages.done())
