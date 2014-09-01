/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var assert = require('assert');
var should = require('should');
var Template = require('..');
var template = new Template();
var consolidate = require('consolidate');
var _ = require('lodash');


describe('render page:', function () {
  beforeEach(function () {
    template = new Template();
  });

  it('should use `file.path` to determine the correct consolidate engine to render content:', function (done) {
    template.engine('hbs', consolidate.handlebars);
    template.engine('md', consolidate.handlebars);
    template.engine('jade', consolidate.jade);
    template.engine('swig', consolidate.swig);
    template.engine('tmpl', consolidate.lodash);

    template.page({path: 'fixture.hbs', content: '<title>{{author}}</title>', author: 'Jon Schlinkert'});
    template.page({path: 'fixture.tmpl', content: '<title><%= author %></title>', author: 'Jon Schlinkert'});
    template.page({path: 'fixture.jade', content: 'title= author', author: 'Jon Schlinkert'});
    template.page({path: 'fixture.swig', content: '<title>{{author}}</title>', author: 'Jon Schlinkert'});
    template.page({'fixture.swig': {content: '<title>{{author}}</title>', author: 'Jon Schlinkert'}});
    template.page('fixture.hbs', '<title>{{author}}</title>', {author: 'Jon Schlinkert'});
    template.page('fixture.md', '---\nauthor: Jon Schlinkert\n---\n<title>{{author}}</title>', {author: 'Brian Woodward'});

    Object.keys(template.cache.pages).forEach(function(file) {
      var page = template.cache.pages[file];

      template.render(page, function (err, content) {
        if (err) console.log(err);
        content.should.equal('<title>Jon Schlinkert</title>');
      });
    });
    done();
  });

  it('should prefer front-matter data over locals:', function (done) {
    template.engine('hbs', consolidate.handlebars);
    template.engine('md', consolidate.handlebars);

    template.page('fixture.md', '---\nauthor: Jon Schlinkert\n---\n<title>{{author}}</title>', {author: 'Brian Woodward'});

    Object.keys(template.cache.pages).forEach(function(file) {
      var page = template.cache.pages[file];
      template.render(page, function (err, content) {
        if (err) console.log(err);
        content.should.equal('<title>Jon Schlinkert</title>');
      });
    });
    done();
  });


  it('should render custom template types:', function (done) {
    template.option('mergePartials', true);

    template.engine('hbs', consolidate.handlebars);
    template.engine('md', consolidate.handlebars);
    template.create('post', 'posts', {renderable: true});

    template.create('include', 'includes');

    template.include('sidebar.hbs', '<nav>sidebar stuff...</nav>');
    template.post('2014-08-31.md', '---\nauthor: Jon Schlinkert\n---\n<title>{{author}}</title>\n{{> sidebar }}', {author: 'Brian Woodward'});

    Object.keys(template.cache.posts).forEach(function(file) {
      var post = template.cache.posts[file];

      template.render(post, function (err, content) {
        if (err) console.log(err);
        content.should.equal('<title>Jon Schlinkert</title>');
      });
    });
    done();
  });
});
