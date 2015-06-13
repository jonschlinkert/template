/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

require('should');
var Template = require('./app');
var _ = require('lodash');
var template;

describe('template create:', function () {
  beforeEach(function () {
    template = new Template();
  });

  describe('.create():', function () {
    it('should create a new template `subtype`:', function () {
      template.create('include', { viewType: 'partial' });
      template.should.have.property('include');
    });

    it('should create the inflection for a `subtype`:', function () {
      template.create('include', { viewType: 'partial' });
      template.should.have.property('includes');
    });

    it('should add a view collection for a subtype:', function () {
      template.create('include', { viewType: 'partial' });
      template.views.should.have.property('includes');
    });
  });

  describe('override:', function () {
    it('should override default template subtypes:', function () {
      template.create('page', { viewType: 'renderable' }, ['default'], function (file) {
        _.forOwn(file, function (value, key) {
          value.zzz = 'yyy';
        });
        return file;
      });
      template.page({'foo.md': {path: 'foo.md', content: 'This is content.'}});
      template.should.have.properties('page', 'pages');
      template.views.pages['foo.md'].should.have.property('zzz', 'yyy');
    });
  });

  describe('when a new template type is created:', function () {
    it('should add methods to the cache for that type:', function () {
      template.create('apple');
      template.should.have.properties('apple', 'apples');
    });

    it('should add templates to the cache for a given template type:', function () {
      template.create('apple');

      template.apple('a', 'one');
      template.apple('b', 'two');
      template.apple('c', 'three');

      template.views.should.have.property('apples');
      template.views.apples.should.have.properties('a', 'b', 'c');
    });
  });

  describe('.decorate()', function () {
    beforeEach(function () {
      template = new Template();
      template.engine('md', require('engine-lodash'));

      // create some custom template types
      template.create('block', { viewType: 'layout' });
      template.create('include', { viewType: 'partial' });
      template.create('post', { viewType: 'renderable' });
      template.create('doc', { viewType: 'renderable' });

      // intentionally create dupes using different renderable types
      template.page('aaa.md', '<%= name %>', {name: 'Jon Schlinkert'});
      template.post('aaa.md', '<%= name %>', {name: 'Brian Woodward'});
      template.docs('aaa.md', '<%= name %>', {name: 'Halle Nicole'});

      template.include('sidebar.md', '<nav>sidebar</nav>');
      template.block('default.md', 'abc {% body %} xyz');
    });

    it('should decorate the type with a `get` method:', function () {
      template.should.have.properties(['getPage', 'getPost', 'getDoc', 'getInclude']);
    });

    it('should decorate the type with a `render` method:', function () {
      template.should.have.properties(['renderPage', 'renderPost', 'renderDoc']);
    });

    it('should use a template subtype\'s `render` method to render the template:', function () {
      template.post('abc.md', {content: 'aaa <%= name %> zzz'});
      var rendered = template.renderPost('abc.md', {name: 'Halle'});
      rendered.should.equal('aaa Halle zzz');
    });
  });

  describe('when the `renderable` type is defined on the options:', function () {
    it('should push the name of the type into the `renderable` array:', function () {
      template.create('apple', { viewType: 'renderable' });
      template.create('page', { viewType: 'renderable' });

      template.viewTypes.renderable.should.containEql('pages');
      template.viewTypes.renderable.should.containEql('apples');
      template.viewTypes.renderable.should.containEql('apples');
    });
  });

  describe('when the `layout` type is defined on the options:', function () {
    it('should push the name of the type into the `layout` array:', function () {
      template.create('orange', { viewType: 'layout' });
      template.create('layout', { viewType: 'layout' });

      template.viewTypes.layout.should.containEql('layouts');
      template.viewTypes.layout.should.containEql('oranges');
    });
  });

  describe('when no type type is defined on the options:', function () {
    it('should push the name of the type into the `partial` array:', function () {
      template.create('banana', { viewType: 'partial' });

      template.viewTypes.partial.should.containEql('partials');
      template.viewTypes.partial.should.containEql('bananas');
    });
  });

  describe('when the `partial` type is defined on the options:', function () {
    it('should push the name of the type into the `partial` array:', function () {
      template.create('banana', { viewType: 'partial' });

      template.viewTypes.partial.should.containEql('partials');
      template.viewTypes.partial.should.containEql('bananas');
    });
  });

  describe('when both the `partial` and the `layout` flags are set:', function () {
    it('should push the type into both arrays:', function () {
      template.create('banana', { viewType: ['partial', 'layout'] });

      template.viewTypes.partial.should.containEql('bananas');
      template.viewTypes.layout.should.containEql('bananas');
    });
  });

  describe('when both the `partial` and the `renderable` flags are set:', function () {
    it('should push the type into both arrays:', function () {
      template.create('banana', { viewType: ['partial', 'renderable'] });

      template.viewTypes.partial.should.containEql('bananas');
      template.viewTypes.renderable.should.containEql('bananas');
    });
  });

  describe('when both the `layout` and the `renderable` flags are set:', function () {
    it('should push the type into both arrays:', function () {
      template.create('banana', { viewType: ['layout', 'renderable'] });

      template.viewTypes.layout.should.containEql('bananas');
      template.viewTypes.renderable.should.containEql('bananas');
    });
  });

  describe('when all three types flags are set:', function () {
    it('should push the type into all three arrays:', function () {
      template.create('banana', { viewType: ['partial', 'layout', 'renderable'] });

      template.viewTypes.layout.should.containEql('bananas');
      template.viewTypes.partial.should.containEql('bananas');
      template.viewTypes.renderable.should.containEql('bananas');
    });
  });
});
