'use strict';

var fs = require('fs');
var path = require('path');
var glob = require('glob');
var Template = require('../');
var template = new Template();


/**
 * Create some custom template collections
 */
template.create('post', { viewType: 'renderable' });
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
