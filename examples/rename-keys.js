'use strict';

var fs = require('fs');
var path = require('path');
var glob = require('glob');
var Template = require('../');
var template = new Template();

/**
 * We'll use this arbitrary function to rename the
 * `key` used for storing each template.
 *
 * converts: `a/b/c/d.md` => `c/d`
 */
function renameKey(fp) {
  var ext = path.extname(fp);
  var segs = fp.slice(0, fp.length - ext.length).split(/[\\\/]/);
  var last = segs.slice(-2);
  return last.join('/');
}


/**
 * Create a custom template collection, `posts`
 */
template.create('post', {renameKey: renameKey});


/**
 * For fun, let's create a custom loader too.
 */
template.loader('glob', function (pattern, options) {
  var renameKey = this.options.renameKey;
  return glob.sync(pattern).reduce(function (acc, fp) {
    var str = fs.readFileSync(fp, 'utf8');
    if (renameKey) {
      fp = renameKey(fp);
    }
    acc[fp] = { path: fp, content: str };
    return acc;
  }, {});
});


/**
 * load some `posts`! (make sure to pass the name of our custom loader
 * as the last argument)
 */
template.posts(process.cwd() + '/test/fixtures/*.hbs', ['glob']);


/**
 * Since the `renameKey` function was passed on the `create` method,
 * the `posts` template collection will use it in the collection's
 * `get` method, like so:
 */
var a = template.posts.get('fixtures/a');
console.log(a);
