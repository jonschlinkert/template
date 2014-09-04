/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('..');
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
    b.should.equal('____Jon Schlinkert____[[= name ]]{{= name }}<%= name %>{%= name %}');

    template.useDelims('square');
    var c = process('${ name }[[= name ]]{{= name }}<%= name %>{%= name %}', ctx);
    c.should.equal('${ name }____Jon Schlinkert____{{= name }}<%= name %>{%= name %}');

    template.useDelims('hbs');
    var d = process('${ name }[[= name ]]{{= name }}<%= name %>{%= name %}', ctx);
    d.should.equal('${ name }[[= name ]]____Jon Schlinkert____<%= name %>{%= name %}');
  });

  xit('should use the currently set delimiters with `template.render()`:', function () {
    // var template = new Template();

    // var ctx = {name: '____Jon Schlinkert____'};

    // template.addDelims('lodash', ['<%', '%>']);
    // template.addDelims('hbs', ['{{', '}}']);
    // template.addDelims('square', ['[[', ']]']);

    // template.page('test.', '${ name }[[= name ]]{{= name }}<%= name %>{%= name %}');

    // // using default template
    // template.render('test.txt', ctx, function (err, content) {
    //   if (err) console.log(err);
    //   console.log(content)
    //   // content.should.equal('____Jon Schlinkert____[[= name ]]{{= name }}____Jon Schlinkert____{%= name %}');
    // });

    // template.useDelims('lodash');
    // var a = process('${ name }[[= name ]]{{= name }}<%= name %>{%= name %}', ctx);
    // a.should.equal('${ name }[[= name ]]{{= name }}____Jon Schlinkert____{%= name %}');

    // template.useDelims('es6');
    // var b = process('${ name }[[= name ]]{{= name }}<%= name %>{%= name %}', ctx);
    // b.should.equal('____Jon Schlinkert____[[= name ]]{{= name }}<%= name %>{%= name %}');

    // template.useDelims('square');
    // var c = process('${ name }[[= name ]]{{= name }}<%= name %>{%= name %}', ctx);
    // c.should.equal('${ name }____Jon Schlinkert____{{= name }}<%= name %>{%= name %}');

    // template.useDelims('hbs');
    // var d = process('${ name }[[= name ]]{{= name }}<%= name %>{%= name %}', ctx);
    // d.should.equal('${ name }[[= name ]]____Jon Schlinkert____<%= name %>{%= name %}');
  });
});
