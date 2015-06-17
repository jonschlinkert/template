/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

require('should');
var assert = require('assert');
var Template = require('./app');
var template;

describe('lookups', function () {
  beforeEach(function () {
    template = new Template();
    template.page('a', { content: 'a' });
    template.page('a.hbs', { content: 'a' });
    template.page('a.md', { content: 'a' });
    template.page('b.md', { content: 'b.md' });
    template.page('c.hbs', { content: 'c.hbs' });
    template.page('a/b/c.md', { content: 'this is content...' });
  });
  describe('.matchViews()', function () {
    it('should return matching views.', function () {
      template.matchViews('pages', 'a').should.have.property('a');
      template.matchViews('pages', 'a').a.should.have.property('content');
    });

    it('should match with a glob pattern.', function () {
      template.matchViews('pages', 'a.*').should.have.properties(['a.hbs', 'a.md']);
    });

    it('should match with an array of glob patterns.', function () {
      template.matchViews('pages', ['b.*', 'a.*']).should.have.properties(['b.md', 'a.hbs', 'a.md']);
    });

    it('should use negation patterns.', function () {
      template.matchViews('pages', ['*', '!a.*']).should.have.property('b.md');
      template.matchViews('pages', ['*', '!a.*']).should.not.have.property('a.md');
    });

    it('should return a match when an object is passed as the first arg.', function () {
      var pages = template.views.pages;
      template.matchViews(pages, 'a.*').should.have.properties(['a.hbs', 'a.md']);
    });
  });

  describe('.matchView()', function () {
    it('should return the first matching view.', function () {
      template.matchView('page', 'a').should.have.property('content');
      template.matchView('page', '**/c*').should.have.property('content');
    });

    it('should match with a glob pattern.', function () {
      template.matchView('page', 'a.*').should.property('path');
    });

    it('should match with an array of glob patterns.', function () {
      template.matchView('page', ['z.*', 'a.*']).path.should.equal('a.hbs');
    });

    it('should use negation patterns.', function () {
      template.matchView('page', ['*.*', '!a.*']).path.should.equal('b.md');
    });

    it('should return a match when an object is passed as the first arg.', function () {
      var pages = template.views.pages;
      template.matchView(pages, 'a.*').should.have.property('path');
    });
  });
});
