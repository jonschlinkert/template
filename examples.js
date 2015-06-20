
var fs = require('fs');
var path = require('path');
var through = require('through2');
var template = require('./');
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




// template.loader('a', function(str) {
//   return str;
// });
// template.loader('b', function(str) {
//   return str;
// });


// template.create('page', ['a', 'b']);


// Template.prototype.load = function(options, stack) {
//   return function () {
//     var args = [].slice.call(arguments);
//     var stack = getStack(args);
//     args = args.slice(0, stack.length);
//     var loader = getLoader(args.pop());
//     return loader.apply(this, args);
//   };
// };

// function lastLoader(plural) {
//   return function () {
//     //=> loader stuff
//   };
// };

// Template.prototype.create = function(singular, plural, options, loaders) {
//   union(plural, options, loaders);

//   mixin(plural, function(key, value, opts, stack) {
//     union(plural, opts, stack);

//     return fn.apply(this, args);
//   });
// };


// function union(name, options, stack) {
//   var opts = extend({loaderType: 'sync'}, options);
//   this.loaders[opts.loaderType][name] = stack;
// }

// stack.map(getLoader(type))

// function getLoader(type) {
//   var stack = this.loaders[type];
//   return function (val) {
//     return typeof val === 'string' ? stack[val] : val;
//   };
// }



// template.loader('base', {loaderType: 'sync'}, function() {});
// template.loader('base', {loaderType: 'async'}, function() {});

// template.create('pages', ['base']);


// template.pages('*.hbs', {loaderType: 'async'}, ['base']);
