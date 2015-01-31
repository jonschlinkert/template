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
var consolidate = require('consolidate');
var Template = require('..');
var template = new Template();


describe('.renderType()', function () {
  beforeEach(function () {
    template = new Template();

    template.create('post', 'posts', { isRenderable: true });
    template.create('doc', 'docs', { isRenderable: true });

    template.page('aaa.md', '<%= name %>', {name: 'Jon Schlinkert'});
    template.post('aaa.md', '<%= name %>', {name: 'Brian Woodward'});
    template.docs('aaa.md', '<%= name %>', {name: 'Halle Nicole'});
  });

  describe('when the name of a cached template is passed to `.renderType()`:', function () {
    it('should get the template from the cache and render it:', function (done) {
      var render = template.renderType('renderable');

      render('aaa.md', function (err, content) {
        if (err) console.log(err);
        content.should.equal('Jon Schlinkert');
        done();
      });
    });

    it('should render a `page`:', function (done) {
      var renderPage = template.renderType('renderable', 'pages');

      renderPage('aaa.md', function (err, content) {
        if (err) console.log(err);
        content.should.equal('Jon Schlinkert');
        done();
      });
    });

    it('should render custom template type, `posts`:', function (done) {
      var renderPost = template.renderType('renderable', 'posts');

      renderPost('aaa.md', function (err, content) {
        if (err) console.log(err);
        content.should.equal('Brian Woodward');
        done();
      });
    });

    it('should render custom template type, `docs`:', function (done) {
      var renderDocs = template.renderType('renderable', 'docs');

      renderDocs('aaa.md', function (err, content) {
        if (err) console.log(err);
        content.should.equal('Halle Nicole');
        done();
      });
    });

    it('should render the first matching template if dupes are found:', function (done) {
      template.renderType('renderable')('aaa.md', function (err, content) {
        if (err) console.log(err);
        content.should.equal('Jon Schlinkert');
        done();
      });
    });

    it('should use give preference to locals:', function (done) {
      template.renderType('renderable')('aaa.md', {name: 'FOFOFOFO'}, function (err, content) {
        if (err) console.log(err);
        content.should.equal('FOFOFOFO');
        done();
      });
    });

    it('should throw an error when the template is not found', function (done) {
      try {
        template.renderType('renderable')('nothing.md', function (err, content) {
          if (!err) return done(new Error('Expected an error.'));
          return done();
        });
      } catch (err) {
        if (!err) return done(new Error('Expected an error.'));
        return done();
      }
    });
  });

  describe('renderSubtype', function () {
    it('should render a subtype', function (done) {
      template.renderSubtype('page')('aaa.md', function(err, content) {
        if (err) return done(err);
        content.should.equal('Jon Schlinkert');
        done();
      });
    });

    it('should throw an error when the template is not found', function (done) {
      try {
        template.renderSubtype('page')('nothing.md', function (err, content) {
          if (!err) return done(new Error('Expected an error.'));
          return done();
        });
      } catch (err) {
        if (!err) return done(new Error('Expected an error.'));
        return done();
      }
    });
  });
});
