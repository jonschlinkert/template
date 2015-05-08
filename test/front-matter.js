/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var fs = require('fs');
var path = require('path');
var should = require('should');
var Template = require('./app');
var template = new Template();

describe.skip('template front-matter', function () {
  beforeEach(function () {
    template = new Template();
    template.create('include');
  });

  describe('data:', function () {
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

  describe('data.page:', function () {
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
  });

  describe('data.include:', function () {    
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

  describe('`data.page` context:', function () {
    it('should expose `data.page` to templates:', function (cb) {
      template.page('a', '---\nb: c\n---\n<%= page.b %>');
      template.render('a', function (err, content) {
        if (err) console.log(err);
        content.should.equal('c');
        cb();
      });
    });
  });

  // describe('context handling:', function () {
  //   it.only('should correctly handle nested contexts:', function (cb) {
  //     template.data({title: 'zzz'});

  //     template.include('a', '<%= title %>');
  //     template.include('b', '<%= title %>', {locals: 'xxx'});
  //     template.include('c', '---\ntitle: ccc\n---\n<%= title %>');
  //     template.include('d', '---\ntitle: ddd\n---\n<%= include.title %>');

  //     template.page('a', '<%= title %>');
  //     template.page('b', '<%= locals.title %>', {locals: 'xxx'});
  //     template.page('c', '---\ntitle: ccc\n---\n<%= title %>');
  //     template.page('d', '---\ntitle: ddd\n---\n<%= page.title %>');
  //     template.page('e', '---\ntitle: eee\n---\n<%= include("a") %>');
  //     template.page('f', '---\ntitle: fff\n---\n<%= include("b") %>');
  //     template.page('g', '---\ntitle: ggg\n---\n<%= include("c") %>');
  //     template.page('h', '---\ntitle: hhh\n---\n<%= include("d") %>');
  //     template.page('i', '---\ntitle: iii\n---\n<%= include("a", {title: "_aaa"}) %>');
  //     template.page('j', '---\ntitle: jjj\n---\n<%= include("b", {title: "_bbb"}) %>');
  //     template.page('k', '---\ntitle: kkk\n---\n<%= include("c", {title: "_ccc"}) %>');
  //     template.page('l', '---\ntitle: lll\n---\n<%= include("d", {title: "_ddd"}) %>');

  //     template.renderEach('pages', function (err, res) {
  //       if (err) console.log(err);

  //       // console.log(res)
  //       // content.should.equal('c');
  //       cb();
  //     });
  //   });
  // });
});