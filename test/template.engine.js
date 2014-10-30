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
var handlebars = require('engine-handlebars');
var lodash = require('engine-lodash');
var Template = require('..');
var template;


describe('engine delimiters:', function () {
  beforeEach(function () {
    template = new Template();
  });

  it('should use custom delimiters defined on a template type:', function (done) {
    template.engine('*', require('engine-lodash'));
    template.create('doc', 'docs', {
      delims: ['<<', '>>'],
      isRenderable: true,
    });

    template.doc('foo', {content: '<<= name >>', name: 'Halle'});
    template.docs('bar', {content: '<<= name >>', name: 'Brooke'});

    template.render('foo', function (err, content) {
      if (err) console.log(err);
      content.should.equal('Halle');
    });

    template.render('bar', function (err, content) {
      if (err) console.log(err);
      content.should.equal('Brooke');
    });
    done();
  });

  it('should allow the engine to be defined when creating a template type:', function (done) {
    template.engine('handlebars', handlebars);
    template.engine('lodash', lodash);

    template.create('apple', 'apples', {
      engine: 'lodash',
      isRenderable: true
    });

    template.create('orange', 'oranges', {
      engine: 'handlebars',
      isRenderable: true
    });

    template.apple('foo', {content: '<<= name >>{{ name }}<%= name %>', name: 'Halle'});
    template.orange('bar', {content: '<<= name >>{{ name }}<%= name %>', name: 'Brooke'});

    template.render('foo', function (err, content) {
      if (err) console.log(err);
      content.should.equal('<<= name >>{{ name }}Halle');
    });

    template.render('bar', function (err, content) {
      if (err) console.log(err);
      content.should.equal('<<= name >>Brooke<%= name %>');
    });
    done();
  });

  it('should allow the engine to be defined on templates:', function (done) {
    template.engine('handlebars', handlebars);
    template.engine('lodash', lodash);
    template.create('apple', 'apples', { isRenderable: true });
    template.create('orange', 'oranges', { isRenderable: true });

    template.apple('foo', {content: '<<= name >>{{ name }}<%= name %>', name: 'Halle'}, {
      engine: 'lodash'
    });
    template.orange('bar', {content: '<<= name >>{{ name }}<%= name %>', name: 'Brooke'}, {
      engine: 'handlebars'
    });

    template.render('foo', function (err, content) {
      if (err) console.log(err);
      content.should.equal('<<= name >>{{ name }}Halle');
    });

    template.render('bar', function (err, content) {
      if (err) console.log(err);
      content.should.equal('<<= name >>Brooke<%= name %>');
    });
    done();
  });

});
