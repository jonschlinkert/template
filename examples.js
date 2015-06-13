
var fs = require('fs');
var path = require('path');
var through = require('through2');
var Template = require('./');
var template = new Template();
var glob = require('glob');
var File = require('vinyl');

/**
 * async
 */

var opts = { loaderType: 'async' };

// loaders
template.loader('base', opts, function (key, value, next) {
  var results = {};
  results[key] = value;
  next(null, results);
});

// create a custom view collection
template.create('page', opts, ['base']);

template.pages('home', {content: 'this is content...'}, opts,
  function (err, views) {
    if (err) console.error(err);
    console.log('callback', template.views.pages);
  })


/**
 * sync
 */

// sync loaders
template.loader('glob', function(pattern) {
  return glob.sync(pattern);
});

template.loader('read', function(files) {
  return files.reduce(function (acc, fp) {
    var str = fs.readFileSync(fp, 'utf8');
    var name = path.basename(fp);
    acc[name] = {path: fp, content: str};
    return acc;
  }, {});
});

// create a view collection
template.create('include', { viewType: 'partial' }, ['glob', 'read']);

// define sync plugins
function one(options) {
  return function(views) {
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

var foo = template.includes('test/fixtures/*.txt')
  .use(one())
  .use(two())
// console.log(foo)
console.log(foo)

/**
 * stream
 */

var opts = { loaderType: 'stream' };

// loaders
template.loader('glob', opts, function() {
  return through.obj(function (pattern, enc, cb) {
    var stream = this;
    glob(pattern, function (err, files) {
      if (err) return cb(err);
      stream.push(files);
      return cb();
    });
  });
});

template.loader('toVinyl', opts, ['glob'], through.obj(function toVinyl(files, enc, cb) {
  var stream = this;
  files.forEach(function (fp) {
    stream.push(new File({
      path: fp,
      contents: fs.readFileSync(fp)
    }));
  });
  return cb();
}));

template.loader('plugin', opts, through.obj(function(file, enc, cb) {
  var str = file.contents.toString();
  file.contents = new Buffer(str.toLowerCase());
  this.push(file);
  return cb();
}));

// create a template collection
template.create('doc', { viewType: 'renderable', loaderType: 'stream' });

// load templates with the collection-loader
template.docs('test/fixtures/*.txt', ['toVinyl', 'plugin'])
  .on('error', console.error)
  .pipe(through.obj(function(file, enc, cb) {
    console.log(file)
    this.push(file);
    return cb();
  }))
  .on('error', console.error)
  .on('data', function () {
    // console.log(template.views.docs)
  })
