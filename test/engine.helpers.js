/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

require('should');
var fs = require('fs');
var path = require('path');
var Template = require('./app');
var template
var consolidate = require('consolidate');


describe('generic helpers:', function () {
  beforeEach(function () {
    template = new Template();
    template.engine('md', consolidate.lodash);
  });

  describe('generic helpers:', function () {
    it('should register generic template helpers:', function () {
      template.helper('a', function () {});
      template.helper('b', function () {});

      template._.helpers.sync.should.have.properties(['a', 'b']);
    });
  });

  describe('engine-specific helpers:', function () {
    it('should register helpers for an engine:', function () {
      template.engine('hbs', {
        render: function () {}
      });

      var helpers = template.engineHelpers('hbs');
      helpers.addHelper('foo', function (str) {
        return str.toLowerCase();
      });

      helpers.addHelper('bar', function (str) {
        return str.toUpperCase();
      });

      helpers.should.have.properties(['foo', 'bar']);
      helpers.getHelper('foo').should.be.a.function;
      helpers.getHelper('bar').should.be.a.function;
    });

    it('should be chainable:', function () {
      template.engine('hbs', {
        render: function () {}
      });

      var helpers = template.engineHelpers('hbs');

      helpers
        .addHelper('foo', function (str) {
          return str.toLowerCase();
        })
        .addHelper('bar', function (str) {
          return str.toUpperCase();
        });

      helpers.should.have.properties(['foo', 'bar']);
      helpers.getHelper('foo').should.be.a.function;
      helpers.getHelper('bar').should.be.a.function;
    });

    it('should render a file with the specified engine:', function (done) {
      var lodash = template.getEngine('md');

      lodash.render('<%= name %>', {name: 'Jon Schlinkert'}, function (err, content) {
        if (err) console.log(err);
        content.should.equal('Jon Schlinkert');
        done();
      });
    });

    it('should register helpers with the given engine:', function (done) {
      template.engine('hbs', consolidate.handlebars);
      var engine = template.getEngine('hbs');
      var helpers = engine.helpers;

      engine.helpers.addHelper('include', function (filepath) {
        return fs.readFileSync(filepath, 'utf8');
      });

      engine.helpers.should.have.property('include');
      done();
    });

    it('should use helpers with the render method:', function (done) {
      template.engine('hbs', consolidate.handlebars);
      var engine = template.getEngine('hbs');
      var helpers = engine.helpers;

      helpers.addHelper('include', function (filepath) {
        return fs.readFileSync(filepath, 'utf8');
      });

      // just for fun. If this fails, that means the readme is wrong :-)
      // so you probably need to run verb.
      var pkg = require(path.join(process.cwd(), 'package.json'));
      var re = new RegExp('^#\\s*' + pkg.name);

      engine.render('{{include "README.md"}}', function (err, content) {
        if (err) console.log(err);
        content.should.match(re);
      });
      done();
    });

    it('should render a file using helpers passed to an engine.', function(done) {
      var lodash = template.getEngine('md');
      var ctx = {
        name: 'Jon Schlinkert',
        imports: {
          include: function(name) {
            var filepath = path.join('test/fixtures', name);
            return fs.readFileSync(filepath, 'utf8');
          },
          upper: function(str) {
            return str.toUpperCase()
          }
        }
      };

      lodash.render('<%= upper(include("content.tmpl")) %>', ctx, function (err, content) {
        if (err) console.log(err);
        content.should.equal('JON SCHLINKERT');
        done();
      });
    });
  });
});
