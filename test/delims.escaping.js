/*!
 * template <https://github.com/jonschlinkert/template>
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


describe('delimiter escaping:', function () {
  it('should use `escapeDelims` defined in the create method options:', function (done) {
    var template = new Template();
    template.engine('*', require('engine-lodash'));
    template.create('doc', 'docs', {
      escapeDelims: ['<<%', '>>'],
      delims: ['<<', '>>'],
      isRenderable: true,
    });

    template.doc('foo', {content: '<<= name >><<%= name >>', name: 'Jon Schlinkert'});
    template.docs('bar', {content: '<<= name >><<%= name >>', name: 'Brian Woodward'});

    template.render('foo', function (err, content) {
      if (err) console.log(err);
      content.should.equal('Jon Schlinkert<<= name >>');
    });

    template.render('bar', function (err, content) {
      if (err) console.log(err);
      content.should.equal('Brian Woodward<<= name >>');
    });

    // sync
    template.render('foo').should.equal('Jon Schlinkert<<= name >>');
    template.render('bar').should.equal('Brian Woodward<<= name >>');

    done();
  });

  it('should use `escapeDelims` defined on an actual template:', function (done) {
    var template = new Template();
    template.engine('*', require('engine-lodash'));
    template.create('doc', 'docs', { isRenderable: true })

    template.doc('foo', {content: '<<= name >>{{= name }}<<%= name >>', name: 'Jon Schlinkert'}, {
      escapeDelims: ['<<%', '>>'],
      delims: ['<<', '>>']
    });
    template.doc('bar', {content: '<<= name >>{{= name }}{{%= name }}', name: 'Brian Woodward'}, {
      escapeDelims: ['{{%', '}}'],
      delims: ['{{', '}}']
    });

    template.render('foo', function (err, content) {
      if (err) console.log(err);
      content.should.equal('Jon Schlinkert{{= name }}<<= name >>');
    });

    template.render('bar', function (err, content) {
      if (err) console.log(err);
      content.should.equal('<<= name >>Brian Woodward{{= name }}');
    });
    done();
  });
});
