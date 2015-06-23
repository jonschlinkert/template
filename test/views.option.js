'use strict';

/* deps: mocha */
var assert = require('assert');
var should = require('should');
var App = require('..');
var app

describe('view.option()', function () {
  beforeEach(function () {
    app = new App();
    app.engine('tmpl', require('engine-lodash'));
    app.create('pages');
  })

  it('should set an option:', function () {
    app.pages.options.should.not.have.property('foo');
    app.pages.option('foo', 'bar');
    app.pages.options.should.have.property('foo');
  });

  it('should extend options:', function () {
    app.pages('a.tmpl', {path: 'a.tmpl', content: '<%= a %>'});
    app.pages.option('a', 'b');
    app.pages.option('c', 'd');
    app.pages.option('e', 'f');
    app.pages.options.should.have.properties(['a', 'c', 'e']);
  });

  it('should emit events:', function () {
    app.pages('a.tmpl', {path: 'a.tmpl', content: '<%= a %>'});
    var events = [];

    app.pages.on('option', function (key, value) {
      events.push(key);
    });

    app.pages.option('a', 'b');
    app.pages.option('c', 'd');
    app.pages.option('e', 'f');
    app.pages.option({g: 'h'});

    events.should.eql(['a', 'c', 'e', 'g']);
  });
});
