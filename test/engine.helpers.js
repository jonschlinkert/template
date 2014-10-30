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
var Template = require('..');
var template = new Template();
var consolidate = require('consolidate');


describe('engine render:', function () {
  it('should register helpers for an engine:', function () {
    template.engine('hbs', {
      render: function () {}
    });

    var helpers = template.helpers('hbs');
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

    var helpers = template.helpers('hbs');

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

    helpers.addHelper('include', function (filepath) {
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
      re.test(content).should.be.true;
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
