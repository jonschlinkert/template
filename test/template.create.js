/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('..');
var _ = require('lodash');
var template;

describe('template create:', function () {
  beforeEach(function () {
    template = new Template();
  });

  describe('.create():', function () {
    it('should create a new template `type`:', function () {
      template.create('include', 'includes');
      template.should.have.properties('include', 'includes');
    });
  });

  describe('override:', function () {
    it('should override default template subtypes:', function () {
      template.create('page', { isRenderable: true}, [
        function (file, next) {
          _.forOwn(file, function (value, key) {
            value.zzz = 'yyy';
          });
          next(null, file);
        }
      ], function (err) {
        if (err) console.log(err);
      });
      template.page({'foo.md': {path: 'foo.md', content: 'This is content.'}});
      template.should.have.properties('page', 'pages');
      template.views.pages['foo.md'].should.have.property('zzz', 'yyy');
    });
  });

  describe('when a new template type is created:', function () {
    it('should add methods to the cache for that type:', function () {
      template.create('apple', 'apples');
      template.should.have.properties('apple', 'apples');
    });

    it('should add templates to the cache for a given template type:', function () {
      template.create('apple', 'apples');

      template.apple('a', 'one');
      template.apple('b', 'two');
      template.apple('c', 'three');

      template.views.should.have.property('apples');
      template.views.apples.should.have.properties('a', 'b', 'c');
    });

    describe('.decorate()', function () {

      /* setup */

      beforeEach(function () {
        template = new Template();

        // create some custom template types
        template.create('block', 'blocks', { isLayout: true });
        template.create('include', 'includes', { isPartial: true });
        template.create('post', 'posts', { isRenderable: true });
        template.create('doc', 'docs', { isRenderable: true });

        // intentionally create dupes using different renderable types
        template.page('aaa.md', '<%= name %>', {name: 'Jon Schlinkert'});
        template.post('aaa.md', '<%= name %>', {name: 'Brian Woodward'});
        template.docs('aaa.md', '<%= name %>', {name: 'Halle Nicole'});

        template.include('sidebar.md', '<nav>sidebar</nav>');
        template.block('default.md', 'abc {% body %} xyz');
      });

      /* tests */

      it('should decorate the type with a `get` method:', function () {
        template.should.have.properties(['getPage', 'getPost', 'getDoc', 'getInclude']);
      });

      it('should decorate the type with a `render` method:', function () {
        template.should.have.properties(['renderPage', 'renderPost', 'renderDoc']);
      });

      it('should use a template subtype\'s `render` method to render the template:', function () {
        template.post('abc.md', {content: 'aaa <%= name %> zzz'});
        var render = template.renderPost()
        render('abc.md', {name: 'Halle'}).should.equal('aaa Halle zzz');
      });
    });
  });

  describe('when the `isRenderable` flag is set on the options:', function () {
    it('should push the name of the type into the `isRenderable` array:', function () {
      template.create('apple', 'apples', { isRenderable: true });

      template.type.renderable.should.containEql('pages');
      template.type.renderable.should.containEql('apples');
      template.type.renderable.should.containEql('apples');
    });
  });

  describe('when the `isLayout` flag is set on the options:', function () {
    it('should push the name of the type into the `isLayout` array:', function () {
      template.create('orange', 'oranges', { isLayout: true });

      template.type.layout.should.containEql('layouts');
      template.type.layout.should.containEql('oranges');
    });
  });

  describe('when no type flag is set on the options:', function () {
    it('should push the name of the type into the `isPartial` array:', function () {
      template.create('banana', 'bananas');

      template.type.partial.should.containEql('partials');
      template.type.partial.should.containEql('bananas');
    });
  });

  describe('when the `isPartial` flag is set on the options:', function () {
    it('should push the name of the type into the `isPartial` array:', function () {
      template.create('banana', 'bananas', { isPartial: true });

      template.type.partial.should.containEql('partials');
      template.type.partial.should.containEql('bananas');
    });
  });

  describe('when both the `isPartial` and the `isLayout` flags are set:', function () {
    it('should push the type into both arrays:', function () {
      template.create('banana', 'bananas', { isPartial: true, isLayout: true });

      template.type.partial.should.containEql('bananas');
      template.type.layout.should.containEql('bananas');
    });
  });

  describe('when both the `isPartial` and the `isRenderable` flags are set:', function () {
    it('should push the type into both arrays:', function () {
      template.create('banana', 'bananas', { isPartial: true, isRenderable: true });

      template.type.partial.should.containEql('bananas');
      template.type.renderable.should.containEql('bananas');
    });
  });

  describe('when both the `isLayout` and the `isRenderable` flags are set:', function () {
    it('should push the type into both arrays:', function () {
      template.create('banana', 'bananas', { isLayout: true, isRenderable: true });

      template.type.layout.should.containEql('bananas');
      template.type.renderable.should.containEql('bananas');
    });
  });

  describe('when all three types flags are set:', function () {
    it('should push the type into all three arrays:', function () {
      template.create('banana', 'bananas', { isPartial: true, isLayout: true, isRenderable: true });

      template.type.layout.should.containEql('bananas');
      template.type.partial.should.containEql('bananas');
      template.type.renderable.should.containEql('bananas');
    });
  });
});
