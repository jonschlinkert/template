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


describe('.render() cached templates', function () {
  beforeEach(function (done) {
    template = new Template();
    done();
  });

  describe('when the name of a cached template is passed to `.render()`:', function () {
    it('should get the template from the cache and render it:', function (done) {
      template.page('aaa.md', '<%= name %>', {name: 'Jon Schlinkert'});

      template.render('aaa.md', function (err, content) {
        if (err) console.log(err);
        content.should.equal('Jon Schlinkert');
        done();
      });
    });

    it('should render the first matching template is dupes are found:', function (done) {
      template.page('aaa.md', '<%= name %>', {name: 'Brian Woodward'});
      template.create('post', 'posts', { isRenderable: true });
      template.post('aaa.md', '<%= name %>', {name: 'Jon Schlinkert'});

      template.render('aaa.md', function (err, content) {
        if (err) console.log(err);
        content.should.equal('Brian Woodward');
        done();
      });
    });
  });

  describe('engine render:', function () {
    it('should use the key of a cached template to determine the consolidate engine to use:', function (done) {
      template.engine('hbs', consolidate.handlebars);
      template.engine('swig', consolidate.swig);
      template.engine('tmpl', consolidate.lodash);

      template.page('a.hbs', {content: '<title>{{title}}</title>', title: 'Handlebars'});
      template.page('b.tmpl', {content: '<title><%= title %></title>', title: 'Lo-Dash'});
      template.page('d.swig', {content: '<title>{{title}}</title>', title: 'Swig'});

      Object.keys(template.views.pages).forEach(function(name) {
        var ext = path.extname(name);

        template.render(name, function (err, content) {
          if (err) console.log(err);

          if (ext === '.hbs') {
            content.should.equal('<title>Handlebars</title>');
          }
          if (ext === '.tmpl') {
            content.should.equal('<title>Lo-Dash</title>');
          }
          if (ext === '.swig') {
            content.should.equal('<title>Swig</title>');
          }
        });
      });

      done();
    });
  });
});
