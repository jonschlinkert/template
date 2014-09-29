/*!
 * view-cache <https://github.com/jonschlinkert/view-cache>
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


describe('template function:', function () {
  it('should use the function to process the template:', function (done) {
    var template = new Template();
    template.engine('*', require('engine-lodash'));

    template.create('doc', 'docs', { isRenderable: true , delims: ['<<', '>>']})

    template.doc('foo', {content: '<<= name >>', name: 'Jon Schlinkert'}, function (acc, value, key) {
      console.log('value:', value);
      console.log('key:', key);
      if (acc) {

        acc.baz = 'bar';
      }
      return acc;
    });

    // template.docs('bar', {content: '<<= name >>', name: 'Brian Woodward'});

    // template.render('foo', function (err, content) {
    //   if (err) console.log(err);
    //   content.should.equal('Jon Schlinkert');
    // });

    // template.render('bar', function (err, content) {
    //   if (err) console.log(err);
    //   content.should.equal('Brian Woodward');
    // });
    done();
  });
});
