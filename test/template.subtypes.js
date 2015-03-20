/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var assert = require('assert');
var should = require('should');
var Template = require('..');
var template;

describe('template partial', function () {
  beforeEach(function () {
    template = new Template();
  });

  describe('when a partial has a layout defined:', function () {
    it.skip('should use render', function () {
      template.layout('default.md', 'bbb{% body %}bbb');
      template.layout('href.md', '<a href="{% body %}"><%= text %></a>');
      template.partials('link.md', '---\nlayout: href.md\ntext: Jon Schlinkert\n---\nhttps://github.com/jonschlinkert', {a: 'b'});
      template.page('home.md', '---\nname: Home Page\nlayout: default.md\n---\nThis is home page content.\n<%= partial("link.md", {c: "d"}) %>');
      var content = template.render('home.md');
      content.should.equal('bbbThis is home page content.\n<a href="https://github.com/jonschlinkert">Jon Schlinkert</a>bbb');
    });

    it('should use render.', function (done) {
      template.layout('default.md', 'bbb{% body %}bbb');
      template.layout('href.md', '<a href="{% body %}"><%= text %></a>');
      template.partials('link.md', '---\nlayout: href.md\ntext: Jon Schlinkert\n---\nhttps://github.com/jonschlinkert', {a: 'b'});
      template.page('home.md', '---\nname: Home Page\nlayout: default.md\n---\nThis is home page content.\n<%= partial("link.md", {c: "d"}) %>');
      template.render('home.md', function (err, content) {
        if (err) return done(err);
        content.should.equal('bbbThis is home page content.\n<a href="https://github.com/jonschlinkert">Jon Schlinkert</a>bbb');
        done();
      });
    });
  });
});
