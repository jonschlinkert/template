/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('..');
var template;

describe('.mergePartials():', function () {
  beforeEach(function () {
    template = new Template();

    // create some template subtypes
    template.create('post', { isRenderable: true });
    template.create('doc', { isRenderable: true });
    template.create('block', { isLayout: true });
    template.create('include', { isPartial: true });

    // add some templates
    template.post('a', {content: 'a'});
    template.doc('b', {content: 'b'});
    template.page('c', {content: 'c'});

    template.layout('d', {content: 'd'});
    template.block('e', {content: 'e'});

    template.partial('f', {content: 'f'});
    template.include('g', {content: 'g'});
  });

  describe.skip('should merge partials onto one object:', function () {
    // todo
  });

  describe.skip('should return partials on separate objects:', function () {
    // todo
  });
});
