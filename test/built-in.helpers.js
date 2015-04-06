/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var async = require('async');
var should = require('should');
var consolidate = require('consolidate');
var handlebars = require('engine-handlebars');
var lodash = consolidate.lodash;
var swig = consolidate.swig;
var Template = require('..');
var template;


describe('generated helpers:', function () {
  /* deps: swig */
  describe('helpers for built-in template types:', function () {
    beforeEach(function () {
      template = new Template();
      template.engine(['*', '.md'], require('engine-lodash'));
    });

    it('should use the `partial` helper with a built-in engine.', function (done) {
      template.partial('a.md', {content: '---\nname: "AAA"\n---\n<%= name %>', locals: {name: 'BBB'}});
      template.page('b.md', {path: 'b.md', content: 'foo <%= partial("a.md") %> bar'});

      template.render('b.md', function (err, content) {
        if (err) return done(err);
        content.should.equal('foo AAA bar');
        done();
      });
    });

    it.skip('should not use the `partial` helper when `default helpers` is disabled.', function (done) {
      template.disable('default helpers');
      template.partial('a.md', {content: '---\nname: "AAA"\n---\n<%= name %>', locals: {name: 'BBB'}});
      template.page('b.md', {path: 'b.md', content: 'foo <%= partial("a.md") %> bar'});

      template.render('b.md', function (err, content) {
        if (err) return done(err);
        content.should.equal('foo AAA bar');
        done();
      });
    });

    it('should use the `partial` helper and locals with a built-in engine.', function (done) {
      template.partial('abc.md', {content: '---\nname: "AAA"\n---\n<%= name %>', locals: {name: 'BBB'}});
      template.page('xyz.md', {path: 'xyz.md', content: 'foo <%= partial("abc.md", { name: "CCC" }) %> bar'});

      template.render('xyz.md', {name: 'DDD'}, function (err, content) {
        if (err) return done(err);
        content.should.equal('foo CCC bar');
        done();
      });
    });

    it('should return an empty string when the partial is missing.', function (done) {
      template.partial('abc.md', {content: '---\nname: "AAA"\n---\n<%= name %>', locals: {name: 'BBB'}});
      template.page('xyz.md', {path: 'xyz.md', content: 'foo <%= partial("def.md", { name: "CCC" }) %> bar'});

      template.render('xyz.md', {name: 'DDD'}, function (err, content) {
        if (err) return done(err);
        content.should.equal('foo  bar');
        done();
      });
    });

    it('should return an empty string when the partial is missing.', function (done) {
      template.partial('abc.md', {content: '---\nname: "AAA"\n---\n<%= name %>', locals: {name: 'BBB'}});
      template.page('xyz.md', {path: 'xyz.md', content: 'foo <%= partial("def.md", { name: "CCC" }) %> bar'});
      template.render('xyz.md', {name: 'DDD'}, function (err, content) {
        if (err) return done(err);
        content.should.eql('foo  bar');
        done();
      });
    });

    it('should throw an error when something is wrong in a partial', function (done) {
      var called = false;
      var cb = function (err) {
        if (called) return;
        called = true;
        done(err);
      };

      template.partial('abc.md', {content: '---\nname: "AAA"\n---\n<%= name %> - <%= foo(name) %>', locals: {name: 'BBB'}});
      template.page('xyz.md', {path: 'xyz.md', content: 'foo <%= partial("abc.md", { name: "CCC" }) %> bar'});
      template.render('xyz.md', {name: 'DDD'}, function (err, content) {
        if (!err) return cb('Expected an error.');
        cb();
      });
    });

    it('should throw an error when something is wrong in a partial', function () {
      template.partial('abc.md', {content: '---\nname: "AAA"\n---\n<%= name %> - <%= foo(name) %>', locals: {name: 'BBB'}});
      template.page('xyz.md', {path: 'xyz.md', content: 'foo <%= partial("abc.md", { name: "CCC" }) %> bar'});
      try {
        template.render('xyz.md', {name: 'DDD'}).should.eql('foo CCC bar');
      } catch (err) {
        if (!err) throw new Error('Expected an error.');
      }
    });
  });


  describe('helper context:', function () {
    beforeEach(function () {
      template = new Template();
      template.engine(['*', '.md'], require('engine-lodash'));
    });

    it('should give preference to front-matter over template locals and helper locals.', function (done) {
      template.partial('a.md', {content: '---\nname: "AAA"\n---\n<%= name %>', locals: {name: 'BBB'}});
      template.page('b.md', {path: 'b.md', content: 'foo <%= partial("a.md") %> bar'});

      template.render('b.md', function (err, content) {
        if (err) return done(err);
        content.should.equal('foo AAA bar');
        done();
      });
    });

    it('should give preference to helper locals over template locals.', function (done) {
      template.partial('abc.md', {content: '<%= name %>', name: 'BBB'});
      template.page('xyz.md', {path: 'xyz.md', content: 'foo <%= partial("abc.md", { name: "CCC" }) %> bar'});

      template.render('xyz.md', {name: 'DDD'}, function (err, content) {
        if (err) return done(err);
        content.should.equal('foo CCC bar');
        done();
      });
    });

    it('should give preference to template locals over render locals.', function (done) {
      template.partial('abc.md', {content: '<%= name %>', name: 'BBB'});
      template.page('xyz.md', {path: 'xyz.md', content: 'foo <%= partial("abc.md") %> bar'});

      template.render('xyz.md', {name: 'DDD'}, function (err, content) {
        if (err) return done(err);
        content.should.equal('foo DDD bar');
        done();
      });
    });

    it('should use render locals when other locals are not defined.', function (done) {
      template.partial('abc.md', {content: '<%= name %>'});
      template.page('xyz.md', {path: 'xyz.md', content: 'foo <%= partial("abc.md") %> bar'});

      template.render('xyz.md', {name: 'DDD'}, function (err, content) {
        if (err) return done(err);
        content.should.equal('foo DDD bar');
        done();
      });
    });
  });


  describe('user-defined engines:', function () {
    beforeEach(function () {
      template = new Template();
    });

    it('should use the `partial` helper with handlebars.', function (done) {
      template.engine('hbs', handlebars);

      template.partial('title.hbs', {content: '<title>{{name}}</title>', locals: {name: 'BBB'}});
      template.page('a.hbs', {path: 'a.hbs', content: 'foo {{{partial "title.hbs" this}}} bar'});

      template.render('a.hbs', {name: 'Halle Nicole' }, function (err, content) {
        if (err) return done(err);
        content.should.equal('foo <title>Halle Nicole</title> bar');
        done();
      });
    });

    it('should use the `partial` helper with any engine.', function (done) {
      template.engine('hbs', handlebars);
      template.engine('md', handlebars);
      template.engine('swig', swig);
      template.engine('tmpl', lodash);

      template.partial('a.hbs', {content: '---\nname: "AAA"\n---\n<title>{{name}}</title>', locals: {name: 'BBB'}});
      template.page('a.hbs', {path: 'a.hbs', content: '<title>{{author}}</title>', locals: {author: 'Halle Nicole'}});
      template.page('b.tmpl', {path: 'b.tmpl', content: '<title><%= author %></title>', locals: {author: 'Halle Nicole'}});
      template.page('d.swig', {path: 'd.swig', content: '<title>{{author}}</title>', locals: {author: 'Halle Nicole'}});
      template.page('e.swig', {path: 'e.swig', content: '<title>{{author}}</title>', locals: {author: 'Halle Nicole'}});
      template.page('f.hbs', {content: '<title>{{author}}</title>', locals: {author: 'Halle Nicole'}});
      template.page('g.md', {content: '---\nauthor: Brian Woodward\n---\n<title>{{author}}</title>', locals: {author: 'Halle Nicole'}});
      template.page('with-partial.hbs', {path: 'with-partial.hbs', content: '{{{partial "a.hbs" custom.locals}}}'});

      template.render('a.hbs', {custom: {locals: {name: 'Halle Nicole' }}}, function (err, content) {
        if (err) console.log(err);
        content.should.equal('<title>Halle Nicole</title>');
      });

      template.render('with-partial.hbs', {custom: {locals: {name: 'Halle Nicole' }}}, function (err, content) {
        if (err) console.log(err);
        content.should.equal('<title>Halle Nicole</title>');
      });

      async.each(template.views.pages, function (file, next) {
        var page = template.views.pages[file];

        template.render(page, {custom: {locals: {name: 'Halle Nicole' }}}, function (err, content) {
          if (err) return next(err);
          content.should.equal('<title>Halle Nicole</title>');
          next(null);
        });
      });
      done();
    });
  });
});
