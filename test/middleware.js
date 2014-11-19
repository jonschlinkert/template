/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var fs = require('fs');
var path = require('path');
var should = require('should');
var Tokens = require('preserve');
var pretty = require('verb-prettify');
var Template = require('..');
var template;
var tokens;


describe('middleware', function () {
  beforeEach(function () {
    template = new Template();
    tokens = new Tokens(/<%=\s*[^>]+%>/g);
  });

  it('should use middleware on cached templates:', function (done) {
    template.route(/\.html/).all(function (file, next) {
      file.content = pretty(file.content, {protect: true});
      next()
    });

    template.pages(__dirname + '/fixtures/html.html');
    var page = template.views.pages['html.html'];

    template.render(page, {name: 'Halle'}, function (err, content) {
      if (err) console.log(err);
      content.should.equal([
        '<!DOCTYPE html>',
        '<html lang="en">',
        '',
        '  <head>',
        '    <meta charset="UTF-8">',
        '    <title>Halle</title>',
        '  </head>',
        '',
        '  <body>Halle</body>',
        '',
        '</html>'
      ].join('\n'));
      done();
    });
  });


  describe('should use middleware on markdown files:', function () {
    it('should preserve templates:', function (done) {
      template.route(/\.md/).all(function (file, next) {
        file.content = tokens.before(file.content);
        next()
      });

      template.pages(__dirname + '/fixtures/md.md');
      var page = template.views.pages['md.md'];

      template.renderTemplate(page, function (err, content) {
        if (err) console.log(err);
        content.should.equal('__ID0__\n__ID1__\n__ID2__');
        tokens.after(content).should.equal('<%= a %>\n<%= b %>\n<%= c %>');
        done();
      });
    });
  });


  /**
   * These methods don't exist yet, but they should ;) so I left
   * them broken until we implement them.
   *
   * This is a pretty good use case as well. It's something that demonstrates
   * why both pre- and post-render need to be implemented. Clearly, in the
   * previous tests I'm also showing that you can obviously run function whatever
   * you want on the rendered content, but the point is to be able to dynamically
   * run functions on certains kinds of content, without having to know what it
   * is in advance.
   */


  describe('should use middleware before and after render:', function () {
    it('should use middleware before and after render:', function (done) {
      template.pages(__dirname + '/fixtures/md.md');
      var page = template.views.pages['md.md'];

      template.before(/\.md/, function (file, next) {
        file.content = tokens.before(file.content);
        next();
      });


      template.render(page, {name: 'Halle'}, function (err, content) {
        if (err) return done(err);
        content.should.equal('__ID0__\n__ID1__\n__ID2__');

        template.after(/\.md/, function (file, next) {
          file.content = tokens.after(file.content);
          next();
        });

        template.render(page, {name: 'Halle'}, function (err, content) {
          if (err) return done(err);
          content.should.equal('<%= a %>\n<%= b %>\n<%= c %>');
          done();
        });

      });
    });

    it('should handle errors in before and after render middleware:', function (done) {
      template.pages(__dirname + '/fixtures/md.md');
      var page = template.views.pages['md.md'];

      template.before(/\.md/, function (file, next) {
        file.content = tokens.before(file.content);
        throw new Error('before error, should get handled');
      }, function (err, file, next) {
        if (err) return next();
        done(new Error('Should have handled the before error'));
      });

      template.render(page, {name: 'Halle'}, function (err, content) {
        if (err) return done(err);
        content.should.equal('__ID0__\n__ID1__\n__ID2__');

        template.after(/\.md/, function (file, next) {
          file.content = tokens.after(file.content);
          throw new Error('after error, should get handled');
        }, function (err, file, next) {
          if (err) return next();
          done(new Error('should have handled the after error'));
        });

        template.render(page, {name: 'Halle'}, function (err, content) {
          if (err) return done(err);
          content.should.equal('<%= a %>\n<%= b %>\n<%= c %>');
          done();
        });
      });
    });
  });
});
