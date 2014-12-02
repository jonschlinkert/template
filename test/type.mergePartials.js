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

  it('should merge partials onto one object:', function () {
    var locals = template.mergePartials({});
    locals.options.should.have.property('partials');
    locals.options.should.not.have.property('includes');
    locals.options.partials.should.have.property('f');
    locals.options.partials.should.have.property('g');
    locals.options.partials.f.should.eql('f');
    locals.options.partials.g.should.eql('g');
  });

  it('should return partials on separate objects:', function () {
    template.disable('mergePartials');
    var locals = template.mergePartials({});
    locals.options.should.have.property('partials');
    locals.options.should.have.property('includes');
    locals.options.partials.should.have.property('f');
    locals.options.includes.should.have.property('g');
    locals.options.partials.f.should.eql('f');
    locals.options.includes.g.should.eql('g');
  });

  it('should use a custom function as mergePartials', function () {
    template.option('mergePartials', function (locals) {
      locals = locals || {};
      locals.options = locals.options || {};
      locals.options.partials = locals.options.partials || {};
      locals.options.partials.foo = 'bar';
      return locals;
    });

    var locals = template.mergePartials();
    locals.options.partials.foo.should.eql('bar');
  })
});
