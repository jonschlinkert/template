/**
 * Assemble
 *
 * Assemble <http://assemble.io>
 * Created and maintained by Jon Schlinkert and Brian Woodward
 *
 * Copyright (c) 2014 Upstage.
 * Licensed under the MIT License (MIT).
 */

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

  it('should process a template with es6 delimiters.', function () {
    var tmpl = fixture('es6-delims.tmpl');
    var actual = template(tmpl, data);
    var expected = 'Jon';
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
    var actual = template(tmpl, data, {namespace: '_cust'});
    var expected = 'Jon\nJon\nJon';
    expect(actual).to.eql(expected);
  });

  it('should process a mixin.', function () {
    var tmpl = fixture('mixin-str.tmpl');
    var actual = template(tmpl, data);
    var expected = 'baz';
    expect(actual).to.eql(expected);
  });

  it('should use the "evaluate" delimater to generate HTML.', function () {
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
    template.copy(src, dest, {data: data, delims: ['{%', '%}']});

    var expected = file.readFileSync('test/actual/COPY.md');
    expect(expected).to.eql('Jon');
    file.delete('test/actual');
  });
});