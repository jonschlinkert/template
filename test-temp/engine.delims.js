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
var Template = require('./app');
var template;


describe('engine-specific delimiters:', function () {
  beforeEach(function () {
    template = new Template();
  });

  it('should use custom delimiters defined on the engine:', function (done) {
    template.engine('*', require('engine-lodash'), {
      delims: ['<<', '>>']
    });

    template.page('foo', {content: '<<= name >>', name: 'Jon Schlinkert'});
    template.page('bar', {content: '<<= name >>', name: 'Brian Woodward'});

    template.render('foo', function (err, content) {
      if (err) return done(err);
      content.should.equal('Jon Schlinkert');
    });

    template.render('bar', function (err, content) {
      if (err) return done(err);
      content.should.equal('Brian Woodward');
    });
    done();
  });
});
