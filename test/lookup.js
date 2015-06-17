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

    template.engine('md', require('engine-lodash'));
    template.engine('hbs', require('engine-handlebars'));

    template.page('a', { content: 'this is a...' });
    template.page('a.hbs', { content: 'a' });
    template.page('a.xxx', { content: 'this is xxx...' });
    template.page('a.zzz', { content: 'this is zzz...' });
    template.page('a.md', { content: 'a' });
    template.page('b.md', { content: 'b.md' });
    template.page('c.hbs', { content: 'c.hbs' });
    template.page('a/b/c.md', { content: 'this is content...' });
  });

  describe('.lookup()', function () {
    it('should find a view without an extension.', function () {
      template.lookup('pages', 'a').path.should.equal('a');
      template.lookup('pages', 'a').content.should.equal('this is a...');
    });

    it('should find a view with an extension.', function () {
      template.lookup('pages', 'a.hbs').path.should.equal('a.hbs');
    });

    it('should find a view with a given extension.', function () {
      template.lookup('pages', 'c', '.hbs').content.should.equal('c.hbs');
      template.lookup('pages', 'a', '.zzz').content.should.equal('this is zzz...');
    });

    it('should find a view with an extension defined on `lookupExts`.', function () {
      template.option('lookupExts', 'xxx')
      template.lookup('pages', 'a').content.should.equal('this is xxx...');
      template.lookup('pages', 'a').content.should.not.equal('this is a...');
      template.disable('lookupExts');
    });

    it('should find a view using a glob pattern.', function () {
      template.lookup('pages', '*.hbs').path.should.equal('a.hbs');
    });

    it('should return `null` when nothing is found', function () {
      (template.lookup('pages', 'd') == null).should.be.true;
    });

    it('should throw error when nothing is found and strict errors is enabled', function () {
      template.enable('strict errors');
      (function () {
        template.lookup('pages', 'd');
      }).should.match(/Template#lookup: cannot find view/);
    });
  });
});
