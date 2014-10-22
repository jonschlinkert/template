/*!
 * engine <https://github.com/jonschlinkert/engine>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var fs = require('fs');
var path = require('path');
var should = require('should');
var Engine = require('..');
var template = new Engine();


describe('template function:', function () {
  it.skip('should use the function to process the template:', function (done) {
    var template = new Engine();
    template.engine('*', require('engine-lodash'));

    template.create('doc', 'docs', { isRenderable: true , delims: ['<<', '>>']})

    template.doc('foo', {content: '<<= name >>', name: 'Jon Schlinkert'}, function (value, key, next) {
      next();
    });

    template.docs('bar', {content: '<<= name >>', name: 'Brian Woodward'}, function (value, key, next) {
      next();
    });

    template.render('foo', function (err, content) {
      if (err) console.log(err);
      content.should.equal('Jon Schlinkert');
    });

    template.render('bar', function (err, content) {
      if (err) console.log(err);
      content.should.equal('Brian Woodward');
    });
    done();
  });
});
