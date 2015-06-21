'use strict';

var fs = require('fs');
var path = require('path');
var glob = require('glob');
var Template = require('../');
var template = new Template();


/**
 * Create some custom template collections
 */
template.create('post', {
  viewType: 'renderable',
  mixins: {
    stash: function(name) {
      this.stashes = this.stashes || {};
      this.stashes[name] = this.clone();
      return this;
    },

    restore: function(keys) {
      this.stashes = this.stashes || {};
      keys = keys ? utils.arrayify(keys) : Object.keys(this.stashes);
      var len = keys.length, i = 0;
      if (len === 0) return this;

      while (len--) {
        var stash = this.stashes[keys[i++]];
        for (var key in stash) {
          if (stash.hasOwnProperty(key)) {
            this[key] = stash[key];
          }
        }
      }
      return this;
    }
  },

  recent: function(prop, pattern, options) {
    if (!arguments.length) {
      return recent()(this);
    }
    var views = this;
    if (utils.isObject(pattern)) {
      options = pattern;
      pattern = null;
    }
    if (typeof prop === 'string') {
      views = this.filter(prop, pattern, options);
    }
    return recent()(views, options);
  },


  sort: function() {
    // todo
  },

  sortBy: function() {
    // todo
  },

});
template.create('include', { viewType: 'partial' });


/**
 * load some `posts`! (make sure to pass the name of our custom loader
 * as the last argument)
 */
template.post('' {});


/**
 * Since the `renameKey` function was passed on the `create` method,
 * the `posts` template collection will use it in the collection's
 * `get` method, like so:
 */
var a = template.posts.get('fixtures/a');
console.log(a);
