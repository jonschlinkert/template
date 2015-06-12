/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var assert = require('assert');
require('should');
var Template = require('./app');
var template;

describe('template render method', function () {
  beforeEach(function () {
    template = new Template();
    template.enable('frontMatter');
    template.engine('md', require('engine-lodash'));

    template.layout('default.md', 'bbb{% body %}bbb');
    template.layout('href.md', '<a href="{% body %}"><%= text %></a>');
    template.partials('link.md', '---\nlayout: href.md\ntext: Brooke\n---\nhttps://github.com/jonschlinkert');
    template.page('home.md', '---\nname: Home Page\nlayout: default.md\n---\nThis is home page content.\n<%= partial("link.md") %>');
  });

  describe('should use the `render` method on a template:', function () {
    it('should render the template synchronously:', function () {
      var page = template.getPage('home.md');
      page.render().should.equal('bbbThis is home page content.\n<a href="https://github.com/jonschlinkert">Brooke</a>bbb');
    });

    it('should render the template asynchronously:', function (done) {
      var page = template.getPage('home.md');

      page.render(function (err, content) {
        if (err) return done(err);
        content.should.equal('bbbThis is home page content.\n<a href="https://github.com/jonschlinkert">Brooke</a>bbb');
        done();
      });
    });
  });

  describe('when a `layout` template\'s own render method is used:', function () {
    it('should render the template synchronously:', function () {
      var layout = template.getLayout('href.md');
      layout.render({text: 'Brooke'}).should.equal('<a href="{% body %}">Brooke</a>');
    });

    it('should render the template asynchronously:', function (done) {
      var layout = template.getLayout('href.md');

      layout.render({text: 'Brooke'}, function (err, content) {
        if (err) return done(err);
        content.should.equal('<a href="{% body %}">Brooke</a>');
        done();
      });
    });
  });

  describe('when a `partial` template\'s own render method is used:', function () {
    it('should render the template synchronously:', function () {
      var partial = template.getPartial('link.md');
      partial.render({text: 'Brooke'}).should.equal('<a href="https://github.com/jonschlinkert">Brooke</a>');
    });

    it('should render the template asynchronously:', function (done) {
      var partial = template.getPartial('link.md');

      partial.render({text: 'Brooke'}, function (err, content) {
        if (err) return done(err);
        content.should.equal('<a href="https://github.com/jonschlinkert">Brooke</a>');
        done();
      });
    });
  });
});

describe('collection render method:', function () {
  beforeEach(function () {
    template = new Template();
    template.engine('md', require('engine-lodash'));

    template.enable('frontMatter');
    template.layout('default.md', 'bbb{% body %}bbb');
    template.layout('href.md', '<a href="{% body %}"><%= text %></a>');
    template.page('link.md', '---\nlayout: href.md\ntext: Brooke\n---\nhttps://github.com/jonschlinkert');
    template.page('home.md', '---\nname: Home Page\nlayout: default.md\n---\nThis is home page content.\n<%= page("link.md") %>');
  });

  it('should render the template synchronously:', function () {
    var res = template.renderPage('link.md', {text: 'Brooke'});
    res.should.equal('<a href="https://github.com/jonschlinkert">Brooke</a>');
  });

  it('should render the template asynchronously:', function (cb) {
    template.renderPage('link.md', {text: 'Brooke'}, function (err, content) {
      if (err) return cb(err);
      content.should.equal('<a href="https://github.com/jonschlinkert">Brooke</a>');
      cb();
    });
  });
});
