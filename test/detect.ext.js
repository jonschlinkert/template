/*!
 * engine-engines <https://github.com/jonschlinkert/engine-engines>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var should = require('should');
var Template = require('../tmpl');
var template = new Template();


describe('ext', function() {
  it('should detect the file extension from the template options.', function() {
    var template = new Template();
    template.page('a.md', 'b');

    template.cache.pages.should.have.property('a.md');
    template.cache.pages['a.md'].should.have.property('ext', '.md');
  });

  it('should detect the file extension from the path property.', function() {
    var template = new Template();
    template.page('a', {path: 'a.md', content: 'This is content.'});

    template.cache.pages.should.have.property('a');
    template.cache.pages['a'].should.have.property('ext', '.md');
  });

  it('should detect the file extension from the options.', function() {
    var template = new Template();
    template.page('a', {content: 'This is content.', options: {ext: '.foo'}});
    template.cache.pages.should.have.property('a');
    template.cache.pages['a'].should.have.property('ext', '.foo');
  });

  it('should detect the file extension from the options.', function() {
    var template = new Template();
    template.page('a', {content: 'This is content.'}, {a: 'b'}, {ext: '.foo'});
    template.cache.pages.should.have.property('a');
    template.cache.pages['a'].should.have.property('ext', '.foo');
  });

  it('should detect the file extension from the locals.', function() {
    var template = new Template();
    template.page('a', {content: 'This is content.'}, {ext: '.foo'});
    template.cache.pages.should.have.property('a');
    template.cache.pages['a'].should.have.property('ext', '.foo');
  });
});

