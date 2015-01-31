/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('..');
var template;

describe('template.lookup()', function () {
  beforeEach(function () {
    template = new Template();
    template.page('a', { content: 'a' });
    template.page('b.md', { content: 'b.md' });
    template.page('c.hbs', { content: 'c.hbs' });
  });

  it('should find a page without an extension.', function () {
    template.lookup('pages', 'a').content.should.eql('a');
  });

  it('should find a page with a default extension.', function () {
    template.lookup('pages', 'b').content.should.eql('b.md');
  });

  it('should find a page with a given extension.', function () {
    template.lookup('pages', 'c', '.hbs').content.should.eql('c.hbs');
  });

  it('should return `null` when nothing is found', function () {
    (template.lookup('pages', 'd') == null).should.be.true;
  });

  it('should throw error when nothing is found and strict errors is enabled', function () {
    template.enable('strict errors');
    try {
      template.lookup('pages', 'd');
      done(new Error('Expected an error'));
    } catch (err) {
      if (!err) throw new Error('Expected an error.');
    }
  })
});