/*
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert
 * Licensed under the MIT license.
 */
'use strict';

var expect = require('chai').expect;
var _ = require('lodash');
var template = require('../index.js');
var helpers = require('./helpers/helpers');
var data = helpers.data;

_.mixin(data);

describe('when default delimiters are used:', function () {
  it('should process the template.', function () {
    var tmpl = '<%= name %>';
    var actual = template(tmpl, data);
    var expected = 'Jon';
    expect(actual).to.eql(expected);
  });

  it('should process the template with no spaces.', function () {
    var tmpl = '<%=name%>';
    var actual = template(tmpl, data);
    var expected = 'Jon';
    expect(actual).to.eql(expected);
  });

  it('should process a template with es6 delimiters.', function () {
    var tmpl = '${ name }';
    var actual = template(tmpl, data);
    var expected = 'Jon';
    expect(actual).to.eql(expected);
  });

  it('should process default delims and es6 delims.', function () {
    var tmpl = '${ name } <%= name %> {%= name %}';
    var actual = template(tmpl, data);
    var expected = 'Jon Jon {%= name %}';
    expect(actual).to.eql(expected);
  });

  it('should process default delims and es6 delims.', function () {
    var tmpl = '<%= first %> ${ last }';
    var actual = template(tmpl, {first: 'Jon', last: 'Schlinkert'});
    var expected = 'Jon Schlinkert';
    expect(actual).to.eql(expected);
  });

  it('should process templates with nested variables.', function () {
    var tmpl = '<%= name %> <%= person.name %> <%= person.first.name %>';
    var actual = template(tmpl, data);
    var expected = 'Jon Jon Jon';
    expect(actual).to.eql(expected);
  });
});



describe('when custom delimiters are passed as a third arg:', function () {
  it('should process the template.', function () {
    var tmpl = '{%= name %}';
    var actual = template(tmpl, data, {delims: ['{%', '%}']});
    var expected = 'Jon';
    expect(actual).to.eql(expected);
  });

  it('should should not process es6 and default delims.', function () {
    var tmpl = '${ name } <%= name %> {%= name %}';
    var actual = template(tmpl, data, {delims: ['{%', '%}']});
    var expected = '${ name } <%= name %> Jon';
    expect(actual).to.eql(expected);
  });
});

describe('when the evaluate delimiters are used:', function () {
  it('should generate HTML without escaping it.', function () {
    var list = '<% _.forEach(people, function(name) { %><li><%- name %></li><% }); %>';
    var actual = _.template(list, { 'people': ['Jon', 'Brian'] }, {delims: ['{%', '%}']});
    var expected = '<li>Jon</li><li>Brian</li>';
    expect(actual).to.eql(expected);
  });

  it('should generate HTML without escaping it.', function () {
    var list = '<% _.forEach(people, function(name) { %><li><%- name %></li><% }); %>';
    var actual = _.template(list, { 'people': ['Jon', 'Brian'] });
    var expected = '<li>Jon</li><li>Brian</li>';
    expect(actual).to.eql(expected);
  });
});

