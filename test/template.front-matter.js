/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var fs = require('fs');
var path = require('path');
require('should');
var parser = require('parser-front-matter');
var cloneDeep = require('clone-deep');
var Template = require('./app');
var template = new Template();

// helper
function frontMatter(collection) {
  return function(file, next) {
    parser.parse(file, function (err) {
      if (err) return next(err);
      file.data[collection] = cloneDeep(file.data);
      next();
    });
  }
}

describe('template front-matter', function () {
  beforeEach(function () {
    template = new Template();
    template.create('include', { viewType: 'partial' });
    template.engine('*', require('engine-lodash'));
    template.enable('frontMatter');
  });

  describe('content:', function () {
    it('should not fail when the content property is missing:', function () {
      template.page('a', {foo: ''});
      template.views.pages.a.should.have.property('data');
    });  
  });

  describe('data:', function () {
    it('should add front matter to the `data` property:', function () {
      template.page('a', '---\nb: c\n---\nd');
      template.views.pages.a.should.have.property('data');
      template.views.pages.a.data.should.have.property('b', 'c');
    });

    it('should add front matter to the `data` property:', function () {
      template.page('a', '---\nb: c\n---\nd');
      template.views.pages.a.should.have.property('data');
      template.views.pages.a.data.should.have.property('b', 'c');
    });

    it('should extend the data object on a template with front matter:', function () {
      template.page('a', {content: '---\nb: c\n---\nd', data: {e: 'f'}});
      template.views.pages.a.should.have.property('data');
      template.views.pages.a.data.should.have.property('b', 'c');
      template.views.pages.a.data.should.have.property('e', 'f');
    });
  });

  describe('types:', function () {
    it('should parse front matter on renderable templates:', function () {
      template.page('a', '---\nb: c\n---\nd');
      template.views.pages.a.should.have.property('data');
      template.views.pages.a.data.should.have.property('b', 'c');
    });

    it('should parse front matter on partial templates:', function () {
      template.partial('a', '---\nb: c\n---\nd');
      template.views.partials.a.should.have.property('data');
      template.views.partials.a.data.should.have.property('b', 'c');
    });

    it('should parse front matter on layout templates:', function () {
      template.layout('a', '---\nb: c\n---\nd');
      template.views.layouts.a.should.have.property('data');
      template.views.layouts.a.data.should.have.property('b', 'c');
    });
  });

  describe('frontMatter:', function () {
    it('should not parse front matter when `frontMatter` is disabled:', function () {
      template.page('a', '---\nb: c\n---\nd', {options: {frontMatter: false}});
      template.views.pages.a.should.have.property('data');
      template.views.pages.a.data.should.not.have.property('b');
    });

    it('should not parse front matter when `frontMatter` disabled on `create`:', function () {
      template.create('doc', {frontMatter: false});
      template.docs('a', '---\nb: c\n---\nd');
      template.views.docs.a.should.have.property('data');
      template.views.docs.a.data.should.not.have.property('b');
    });

    it('should extend the data object on a template with front matter:', function () {
      template.page('a', {content: '---\nb: c\n---\nd', data: {e: 'f'}});
      template.views.pages.a.should.have.property('data');
      template.views.pages.a.data.should.have.property('b', 'c');
      template.views.pages.a.data.should.have.property('e', 'f');
    });
  });

  describe('when custom middleware for parsing front matter:', function () {
    describe('data.page:', function () {
      beforeEach(function () {
        template.onLoad(/./, frontMatter('page'));
      });

      it('should clone `data` to the a `data.page` property of a page:', function () {
        template.page('a', '---\nb: c\n---\nd');
        template.views.pages.a.data.should.have.property('page');
        template.views.pages.a.data.page.should.have.property('b', 'c');
      });

      it('should extend the `data.page` object on a template with front matter:', function () {
        template.page('a', {content: '---\nb: c\n---\nd', data: {e: 'f'}});
        template.views.pages.a.data.should.have.property('page');
        template.views.pages.a.data.page.should.have.property('b', 'c');
        template.views.pages.a.data.page.should.have.property('e', 'f');
      });

      it('should expose `data.page` to templates:', function (cb) {
        template.page('a', '---\nb: c\n---\n<%= page.b %>');
        template.render('a', function (err, content) {
          if (err) console.log(err);
          content.should.equal('c');
          cb();
        });
      });
    });

    describe('data.include:', function () {
      beforeEach(function () {
        template.onLoad(/./, frontMatter('include'));
      });

      it('should clone `data` to the a `data.include` property of an include:', function () {
        template.include('a', '---\nb: c\n---\nd');
        template.views.includes.a.data.should.have.property('include');
        template.views.includes.a.data.include.should.have.property('b', 'c');
      });

      it('should extend the `data.include` object on a template with front matter:', function () {
        template.include('a', {content: '---\nb: c\n---\nd', data: {e: 'f'}});
        template.views.includes.a.data.should.have.property('include');
        template.views.includes.a.data.include.should.have.property('b', 'c');
        template.views.includes.a.data.include.should.have.property('e', 'f');
      });
    });

    describe('`data` context:', function () {
      it('should expose `data` to templates:', function (cb) {
        template.page('a', '---\nb: c\n---\n<%= b %>');
        template.render('a', function (err, content) {
          if (err) console.log(err);
          content.should.equal('c');
          cb();
        });
      });
    });
  });

  describe.skip('context handling:', function () {
    beforeEach(function () {
      template.onLoad(/./, function (file, next) {
        var collection = file.options.subtype;

        parser.parse(file, function (err) {
          if (err) return next(err);
          file.data[collection] = cloneDeep(file.data);
          next();
        });
      });
    });

    it('should correctly handle nested contexts:', function (cb) {
      template.data({title: 'zzz'});

      template.include('a', '<%= title %>');
      template.include('b', '<%= title %>', {locals: 'xxx'});
      template.include('c', '---\ntitle: ccc\n---\n<%= title %>');
      template.include('d', '---\ntitle: ddd\n---\n<%= include.title %>');

      template.page('a', '<%= title %>');
      template.page('b', '<%= locals.title %>', {locals: 'xxx'});
      template.page('c', '---\ntitle: ccc\n---\n<%= title %>');
      template.page('d', '---\ntitle: ddd\n---\n<%= page.title %>');
      template.page('e', '---\ntitle: eee\n---\n<%= include("a") %>');
      template.page('f', '---\ntitle: fff\n---\n<%= include("b") %>');
      template.page('g', '---\ntitle: ggg\n---\n<%= include("c") %>');
      template.page('h', '---\ntitle: hhh\n---\n<%= include("d") %>');
      template.page('i', '---\ntitle: iii\n---\n<%= include("a", {title: "_aaa"}) %>');
      template.page('j', '---\ntitle: jjj\n---\n<%= include("b", {title: "_bbb"}) %>');
      template.page('k', '---\ntitle: kkk\n---\n<%= include("c", {title: "_ccc"}) %>');
      template.page('l', '---\ntitle: lll\n---\n<%= include("d", {title: "_ddd"}) %>');

      template.renderEach('pages', function (err, res) {
        if (err) console.log(err);

        console.log(res)
        cb();
      });
    });
  });
});
