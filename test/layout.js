/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('./app');

describe('layouts:', function () {
  describe('default engine:', function () {
    it('should use layouts defined as objects', function (done) {
      var template = new Template();

      template.layout({a: { layout: 'b', content: 'A above\n{% body %}\nA below' }});
      template.layout({b: { layout: 'c', content: 'B above\n{% body %}\nB below' }});
      template.layout({c: { layout: 'd', content: 'C above\n{% body %}\nC below' }});
      template.layout({d: { layout: 'e', content: 'D above\n{% body %}\nD below' }});
      template.layout({last: { layout: undefined, content: 'last!\n{% body %}\nlast!' }});
      template.layout({e: { layout: 'f', content: 'E above\n{% body %}\nE below' }});
      template.layout({f: { layout: 'last', content: 'F above\n{% body %}\nF below' }});
      template.layout({first: { layout: 'a', content: '{% body %}' }});
      template.page('about', 'This is the about page.', {layout: 'first'}, {ext: '.html'});

      var expected = [
        'last!',
        'F above',
        'E above',
        'D above',
        'C above',
        'B above',
        'A above',
        'fooo',
        'A below',
        'B below',
        'C below',
        'D below',
        'E below',
        'F below',
        'last!'
      ].join('\n');

      template.render({content: 'fooo', layout: 'first'}, function(err, content) {
        if (err) return done(err);
        content.should.equal(expected);
        done();
      });
    });

    it('should use layouts defined as objects', function (done) {
      var template = new Template();

      template.layout({a: { layout: 'b', content: 'A above\n{% body %}\nA below' }});
      template.layout({b: { layout: 'c', content: 'B above\n{% body %}\nB below' }});
      template.layout({c: { layout: 'd', content: 'C above\n{% body %}\nC below' }});
      template.layout({d: { layout: 'e', content: 'D above\n{% body %}\nD below' }});
      template.layout({last: { layout: undefined, content: 'last!\n{% body %}\nlast!' }});
      template.layout({e: { layout: 'f', content: 'E above\n{% body %}\nE below' }});
      template.layout({f: { layout: 'last', content: 'F above\n{% body %}\nF below' }});
      template.layout({first: { layout: 'a', content: '{% body %}' }});
      template.page('about', 'This is the about page.', {layout: 'first'}, {ext: '.html'});

      var expected = [
        'last!',
        'F above',
        'E above',
        'D above',
        'C above',
        'B above',
        'A above',
        'This is the about page.',
        'A below',
        'B below',
        'C below',
        'D below',
        'E below',
        'F below',
        'last!'
      ].join('\n');

      template.render('about', function(err, content) {
        if (err) return done(err);
        content.should.equal(expected);
        done();
      });
    });

    it('should use layouts defined as strings:', function (done) {
      var template = new Template();

      template.layout('first', '{% body %}', {layout: 'a'});
      template.layout('a', 'A above\n{% body %}\nA below', {layout: 'b'});
      template.layout('b', 'B above\n{% body %}\nB below', {layout: 'c'});
      template.layout('c', 'C above\n{% body %}\nC below', {layout: 'd'});
      template.layout('d', 'D above\n{% body %}\nD below', {layout: 'e'});
      template.layout('e', 'E above\n{% body %}\nE below', {layout: 'default'});
      template.layout('default', 'default!\n{% body %}\ndefault!');

      var expected = [
        'default!',
        'E above',
        'D above',
        'C above',
        'B above',
        'A above',
        'This is a page!',
        'A below',
        'B below',
        'C below',
        'D below',
        'E below',
        'default!'
      ].join('\n');

      template.render({content: 'This is a page!', layout: 'first'}, function(err, content) {
        if (err) return done(err);
        content.should.eql(expected);
        done();
      });
    });
  });

  describe('default engine:', function () {
    var template = new Template();

    template.layout('sidebar', {content: '<nav></nav>\n{% body %}', layout: 'default'});
    template.layout('default', {content: 'default!\n{% body %}\ndefault!'});

    it('should use layouts defined as strings:', function (done) {
      var expected = [
        'default!',
        '<nav></nav>',
        'This is a page!',
        'default!'
      ].join('\n');

      template.render({content: 'This is a page!', layout: 'sidebar'}, function(err, content) {
        if (err) return done(err);
        content.should.eql(expected);
        done();
      });
    });
  });


  describe.skip('when an `ext` is defined on a template:', function () {
    it('should use the layout defined regardless of extension:', function () {
      //
    });
  });

  describe('option layoutExt', function () {
    it('should append layout ext to layout when applying layout stack', function (done) {
      var template = new Template();
      template.option('layoutExt', 'hbs');
      template.layout('sidebar.hbs', { content: '<nav></nav>\n{% body %}', layout: 'default.hbs' });
      template.layout('default.hbs', { content: 'default!\n{% body %}\ndefault!' });
      template.page('home', { content: 'This is the home page.', layout: 'sidebar' });

      var expected = [
        'default!',
        '<nav></nav>',
        'This is the home page.',
        'default!'
      ].join('\n');

      template.render('home', function (err, content) {
        if (err) return done(err);
        content.should.eql(expected);
        done();
      });
    });
  });


  describe('custom template types:', function () {
    var template = new Template();
    template.create('doc', { isRenderable: true });

    template.layouts('sidebar', { content: '<nav></nav>\n{% body %}', layout: 'default'});
    template.layouts('default', { content: 'default!\n{% body %}\ndefault!' });
    template.doc('home', { content: 'This is the home page.', layout: 'sidebar'});

    it('should use layouts defined as strings:', function (done) {
      var expected = [
        'default!',
        '<nav></nav>',
        'This is the home page.',
        'default!'
      ].join('\n');

      template.render('home', function(err, content) {
        if (err) console.log(err);
        content.should.eql(expected);
        done();
      });
    });
  });
});
