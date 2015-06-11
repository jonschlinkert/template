
var fs = require('fs');
var path = require('path');
var through = require('through2');
var Template = require('./');
var template = new Template();
var glob = require('glob');

/**
 * ssync
 */

// loaders
template.loader('base', {loaderType: 'async'}, function baseAsync(key, value, next) {
  var results = {};
  results[key] = value;
  next(null, results);
});

// create a custom view collection
template.create('page', { loaderType: 'async' }, ['base']);

template.pages('home', {content: 'this is content...'}, { loaderType: 'async' }, function (err, views) {
    if (err) console.error(err);
    console.log('callback', views);
  })
  // .use(function () {
  //   console.log('use', template.views.pages);
  // })


/**
 * sync
 */

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

// create a view collection
template.create('page', ['base']);

// middleware
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

template.pages('test/fixtures/*.txt', ['glob', 'read'])
  // .src('test/fixtures/*.txt')
  // .use(one())
  // .use(two())
  // .use(template.pages.done())

// console.log('template.views.pages:', template.views.pages)


/**
 * stream
 */

// loaders
template.loader('base', { loaderType: 'stream' }, function baseStream(key, value) {
  var stream = through.obj();
  var results = {};
  results[key] = value;
  stream.write(results);
  return stream;
});

template.pages('home', {content: 'this is content...'}, { loaderType: 'stream' })
  .on('error', console.error)
  .pipe(through.obj(function(obj, enc, next) {
    this.push(obj);
    next();
  }, function (cb) {
    // console.log('flush', template.views.pages);
    cb();
  }))
  .on('error', console.error)
  .on('data', function () {
    // console.log('data', template.views.pages);
  });


// template.pages({}, ['foo', 'bar']).src('abc/*.hbs')
//   .pipe(one())
//   .pipe(two())
//   .pipe(template.pages.dest())
