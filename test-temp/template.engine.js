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
var handlebars = require('engine-handlebars');
var lodash = require('engine-lodash');
var Template = require('./app');
var template;


describe('template engine:', function () {
  /* deps: engine-handlebars */
  beforeEach(function () {
    template = new Template();
  });

  it('should allow the engine to be defined when creating a template type:', function (done) {
    template.engine('handlebars', handlebars);
    template.engine('lodash', lodash);

    template.create('apple', {engine: 'lodash', isRenderable: true});
    template.create('orange', {engine: 'handlebars', isRenderable: true});

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

    template.create('apple', { isRenderable: true });
    template.create('orange', { isRenderable: true });

    template.apple('foo', {content: '<<= name >>{{ name }}<%= name %>', locals: {name: 'Halle'}}, {
      engine: 'lodash'
    });
    template.orange('bar', {content: '<<= name >>{{ name }}<%= name %>', locals: {name: 'Brooke'}}, {
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
