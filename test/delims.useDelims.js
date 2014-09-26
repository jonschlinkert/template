/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('../tmpl');
var _ = require('lodash');


describe('template usage:', function () {
  it('should use the currently set delimiters with any custom renderer:', function () {
    var template = new Template();

    var ctx = {name: '____Jon Schlinkert____'};

    template.addDelims('lodash', ['<%', '%>']);
    template.addDelims('hbs', ['{{', '}}']);
    template.addDelims('square', ['[[', ']]']);

    var process = function (str, context) {
      var settings = template.getDelims();
      return _.template(str, context, settings);
    };

    // using default template
    var a = process('${ name }[[= name ]]{{= name }}<%= name %>{%= name %}', ctx);
    a.should.equal('____Jon Schlinkert____[[= name ]]{{= name }}____Jon Schlinkert____{%= name %}');

    template.useDelims('lodash');
    var a = process('${ name }[[= name ]]{{= name }}<%= name %>{%= name %}', ctx);
    a.should.equal('${ name }[[= name ]]{{= name }}____Jon Schlinkert____{%= name %}');

    template.useDelims('es6');
    var b = process('${ name }[[= name ]]{{= name }}<%= name %>{%= name %}', ctx);
    b.should.equal('____Jon Schlinkert____[[= name ]]{{= name }}____Jon Schlinkert____{%= name %}');

    template.useDelims('square');
    var c = process('${ name }[[= name ]]{{= name }}<%= name %>{%= name %}', ctx);
    c.should.equal('${ name }____Jon Schlinkert____{{= name }}<%= name %>{%= name %}');

    template.useDelims('hbs');
    var d = process('${ name }[[= name ]]{{= name }}<%= name %>{%= name %}', ctx);
    d.should.equal('${ name }[[= name ]]____Jon Schlinkert____<%= name %>{%= name %}');
  });

  it('should use the currently set delimiters with `template.render()`:', function () {
    var template = new Template();

    template.engine('lodash', require('engine-lodash'));

    template.addDelims('foo', ['<%', '%>']);
    template.addDelims('bar', ['{{', '}}']);
    template.addDelims('baz', ['<<', '>>']);
    template.addDelims('quux', ['${', '}'], {
      interpolate: /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g
    });

    var base = '${ name }<<= name >>{{= name }}<%= name %>{%= name %}';
    var ctx = {name: '____Jon Schlinkert____', engine: 'lodash'};

    template.page('test.html', base);
    template.page('test.foo', base, {engine: 'lodash'});
    template.page('test.bar', base, {engine: 'lodash'});
    template.page('test.baz', base, {engine: 'lodash'});
    template.page('test.quux', base, {engine: 'lodash'});

    // using default delimiters (should process both es6 and `<%= foo %>` delims)

    template.render(base, ctx, function (err, content) {
      if (err) console.log(err);
      content.should.equal('____Jon Schlinkert____<<= name >>{{= name }}____Jon Schlinkert____{%= name %}');
    });

    // template.render('test.html', ctx, function (err, content) {
    //   if (err) console.log(err);
    //   content.should.equal('____Jon Schlinkert____<<= name >>{{= name }}____Jon Schlinkert____{%= name %}');
    // });

    // custom delimters

    // template.useDelims('foo');
    // template.render('test.foo', ctx, function (err, content) {
    //   if (err) console.log(err);
    //   content.should.equal('${ name }<<= name >>{{= name }}____Jon Schlinkert____{%= name %}');
    // });

    // template.useDelims('bar');
    // template.render('test.bar', ctx, function (err, content) {
    //   if (err) console.log(err);
    //   content.should.equal('${ name }<<= name >>____Jon Schlinkert____<%= name %>{%= name %}');
    // });

    // template.useDelims('baz');
    // template.render('test.baz', ctx, function (err, content) {
    //   if (err) console.log(err);
    //   content.should.equal('${ name }____Jon Schlinkert____{{= name }}<%= name %>{%= name %}');
    // });

    // template.useDelims('quux');
    // template.render('test.quux', ctx, function (err, content) {
    //   if (err) console.log(err);
    //   content.should.equal('____Jon Schlinkert____<<= name >>{{= name }}<%= name %>{%= name %}');
    // });
  });
});
