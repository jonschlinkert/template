/*
 * template
 * https://github.com/jonschlinkert/template
 *
 * Copyright (c) 2013 Jon Schlinkert
 * Licensed under the MIT license.
 */

'use strict';


// Node.js
var path = require('path');

// node_modules
var expect = require('chai').expect;
var file = require('fs-utils');
var _ = require('lodash');

// Local libs
var template = require('../index.js');
var fixture = function(template) {
  return file.readFileSync(path.join(__dirname, 'fixtures', template));
};

describe('Mixin methods from underscore.string:', function () {
  it('should slugify the string with _.str namespace', function () {
    var tmpl = fixture('_str-slugify.tmpl');
    var actual = template(tmpl);
    expect(actual).to.eql('this-should-be-slugified');
  });

  it('should slugify the string.', function () {
    var tmpl = fixture('_slugify.tmpl');
    var actual = template(tmpl, null, {nonconflict: true});
    expect(actual).to.eql('this-should-be-slugified');
  });

  it('should titleize the string with _.str namespace', function () {
    var tmpl = fixture('_str-titleize.tmpl');
    var actual = template(tmpl);
    expect(actual).to.eql('This Should Be Titleized');
  });

  it('should titleize the string.', function () {
    var tmpl = fixture('_titleize.tmpl');
    var actual = template(tmpl, null, {nonconflict: true});
    expect(actual).to.eql('This Should Be Titleized');
  });
});

describe('process templates:', function () {
  var data = {
    name: 'Jon',
    person: {
      name: 'Jon',
      first: {
        name: 'Jon'
      }
    },
    fn: function(val) {
      return val || "FUNCTION!";
    },
    two: {
      three: function(val) {
        return val || "THREE!!";
      }
    }
  };

  _.mixin({
    getVal: function(val) {
      return val || 'DEFAULT!';
    }
  });

  it('should process a template with default delimiters.', function () {
    var tmpl = fixture('default-delims.tmpl');
    var actual = template(tmpl, data);
    var expected = 'Jon';
    expect(actual).to.eql(expected);
  });

  it('should process a template with a string.', function () {
    var tmpl = '<%= "STRING" %>';
    var actual = template(tmpl);
    var expected = 'STRING';
    expect(actual).to.eql(expected);
  });

  it('should process a template with default delimiters with no space.', function () {
    var tmpl = fixture('default-delims-no-space.tmpl');
    var actual = template(tmpl, data);
    var expected = 'Jon';
    expect(actual).to.eql(expected);
  });

  it('should process a template with custom delimiters.', function () {
    var tmpl = fixture('custom-delims.tmpl');
    var actual = template(tmpl, data, {delims: ['{%', '%}']});
    var expected = 'Jon';
    expect(actual).to.eql(expected);
  });

  it('should process a template with custom delimiters, but not es6 and default delims.', function () {
    var tmpl = fixture('custom-delims-only.tmpl');
    var actual = template(tmpl, data, {delims: ['{%', '%}']});
    var expected = '${ name }\n<%= name %>\nJon';
    expect(actual).to.eql(expected);
  });

  it('should process a template with es6 delimiters.', function () {
    var tmpl = fixture('es6-delims.tmpl');
    var actual = template(tmpl, data);
    var expected = 'Jon';
    expect(actual).to.eql(expected);
  });

  it('should process a templates using Lo-Dash defaults, including es6 delimiters.', function () {
    var tmpl = fixture('es6-and-default.tmpl');
    var actual = template(tmpl, data);
    var expected = 'Jon\nJon\n{%= name %}';
    expect(actual).to.eql(expected);
  });

  it('should process templates in a string using Lo-Dash defaults.', function () {
    var tmpl = '<%= first %> ${ last }';
    var actual = template(tmpl, {first: 'Jon', last: 'Schlinkert'});
    var expected = 'Jon Schlinkert';
    expect(actual).to.eql(expected);
  });

  it('should process templates with nested variables.', function () {
    var tmpl = fixture('nested.tmpl');
    var actual = template(tmpl, data);
    var expected = 'Jon\nJon\nJon';
    expect(actual).to.eql(expected);
  });

  it('should process templates with a custom variable.', function () {
    var tmpl = fixture('variable.tmpl');
    var actual = template(tmpl, data, {variable: '_cust'});
    var expected = 'Jon\nJon\nJon';
    expect(actual).to.eql(expected);
  });

  it('should process a mixin.', function () {
    var tmpl = fixture('mixin-str.tmpl');
    var actual = template(tmpl, data);
    var expected = 'baz';
    expect(actual).to.eql(expected);
  });

  it('should use the "evaluate" delimiter to generate HTML.', function () {
    var list = '<% _.forEach(people, function(name) { %><li><%- name %></li><% }); %>';
    var actual = _.template(list, { 'people': ['Jon', 'Brian'] }, {delims: ['{%', '%}']});
    var expected = '<li>Jon</li><li>Brian</li>';
    expect(actual).to.eql(expected);
  });

  it('should use the "evaluate" delimiter to generate HTML.', function () {
    var list = '<% _.forEach(people, function(name) { %><li><%- name %></li><% }); %>';
    var actual = _.template(list, { 'people': ['Jon', 'Brian'] });
    var expected = '<li>Jon</li><li>Brian</li>';
    expect(actual).to.eql(expected);
  });

  it('should process a mixin\'s default value.', function () {
    var tmpl = fixture('mixin-default.tmpl');
    var actual = template(tmpl, data);
    var expected = 'DEFAULT!';
    expect(actual).to.eql(expected);
  });

  it('should process functions in templates.', function () {
    var tmpl = fixture('functions.tmpl');
    var actual = template(tmpl, data);
    var expected = 'FUNCTION!\nVAL!\nTHREE!!';
    expect(actual).to.eql(expected);
  });

  it('should process functions in templates.', function () {
    var tmpl = fixture('date.tmpl');
    var actual = template(tmpl);
    var expected = actual.indexOf('GMT') !== -1;
    expect(expected).to.eql(true);
  });

  it('should copy a file and process templates.', function () {
    var src  = 'test/fixtures/COPY.tmpl';
    var dest = 'test/actual/COPY.md';
    template.copy(src, dest, data, {delims: ['{%', '%}']});

    var expected = file.readFileSync('test/actual/COPY.md');
    expect(expected).to.eql('Jon');
    file.delete('test/actual/COPY.md');
  });
});


describe('process templates using _.template:', function () {
  it('should process a template with default delimiters.', function () {
    var compiled = _.template('hello <%= name %>');
    compiled({ 'name': 'fred' });

    var actual = compiled({ 'name': 'fred' });
    expect(actual).to.eql('hello fred');
  });

  it('should process a template with es6 delimiters.', function () {
    var compiled = _.template('hello ${ name }');
    compiled({ 'name': 'fred' });

    var actual = compiled({ 'name': 'fred' });
    expect(actual).to.eql('hello fred');
  });
});
