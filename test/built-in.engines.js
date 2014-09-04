/*!
 * engine-engines <https://github.com/jonschlinkert/engine-engines>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var should = require('should');
var Template = require('..');
var template = new Template();


describe('default engines', function() {
  it('should register default engines automatically.', function() {
    template.engines.should.have.property('.md');
    template.engines.should.have.property('.html');
    template.engines.should.have.property('.*');
    Object.keys(template.engines).length.should.equal(3);
  });
});

describe('template engine', function() {
  beforeEach(function() {
    template.clear();
  });

  describe('.engine()', function() {
    it('should add engines to the `engines` object.', function() {
      template.engine('a', {
        render: function () {}
      });
      template.engine('b', {
        render: function () {}
      });
      template.engine('c', {
        render: function () {}
      });
      template.engine('d', {
        render: function () {}
      });

      template.engines.should.have.property('.a');
      template.engines.should.have.property('.b');
      template.engines.should.have.property('.c');
      template.engines.should.have.property('.d');
      Object.keys(template.engines).length.should.equal(7);
    });

    it('should normalize engine extensions to not have a dot.', function() {
      template.engine('.a', {
        render: function () {}
      });
      template.engine('.b', {
        render: function () {}
      });
      template.engine('.c', {
        render: function () {}
      });
      template.engine('.d', {
        render: function () {}
      });

      template.engines.should.have.property('.a');
      template.engines.should.have.property('.b');
      template.engines.should.have.property('.c');
      template.engines.should.have.property('.d');
      Object.keys(template.engines).length.should.equal(7);
    });

    it('should be chainable.', function() {
      template
        .engine('a', {
          render: function () {}
        })
        .engine('b', {
          render: function () {}
        })
        .engine('c', {
          render: function () {}
        })
        .engine('d', {
          render: function () {}
        });


      var a = template.getEngine('.a');

      assert.equal(typeof a, 'object');
      assert.equal(typeof a.render, 'function');

      // console.log(template)

      template.engines.should.have.property('.a');
      template.engines.should.have.property('.b');
      template.engines.should.have.property('.c');
      template.engines.should.have.property('.d');
      Object.keys(template.engines).length.should.equal(7);
    });
  });
});


describe('engines', function() {
  var lodash = template.getEngine('md');
  it('should render content with lodash.', function(done) {
    var ctx = {name: 'Jon Schlinkert'};

    lodash.render('<%= name %>', ctx, function (err, content) {
      content.should.equal('Jon Schlinkert');
      done();
    });
  });

  it('should use custom delimiters: swig.', function(done) {
    var ctx = {name: 'Jon Schlinkert', delims: ['{%', '%}']};

    lodash.render('{%= name %}', ctx, function (err, content) {
      content.should.equal('Jon Schlinkert');
      done();
    });
  });

  it('should use custom delimiters: hbs.', function(done) {
    var ctx = {name: 'Jon Schlinkert', delims: ['{{', '}}']};

    lodash.render('{{= name }}', ctx, function (err, content) {
      content.should.equal('Jon Schlinkert');
      done();
    });
  });

  it('should use helpers registered on the imports property.', function(done) {
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


  describe('.getEngine()', function() {
    it('should get an engine.', function() {
      template.engine('a', {
        render: function () {}
      });
      template.engine('b', {
        render: function () {}
      });
      template.engine('c', {
        render: function () {}
      });
      template.engine('d', {
        render: function () {}
      });

      // 4 + 2 built-in engines
      Object.keys(template.engines).length.should.equal(7);

      template.getEngine('a').should.have.property('render');
      template.getEngine('b').should.have.property('render');
      template.getEngine('c').should.have.property('render');
      template.getEngine('d').should.have.property('render');
    });
  });
});
