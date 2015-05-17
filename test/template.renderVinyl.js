/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var assert = require('assert');
var should = require('should');
var Template = require('./app');
var template;

describe('.render', function () {
  beforeEach(function () {
    template = new Template();

    template.layout('default.md', 'bbb{% body %}bbb');
    template.page('a.md', 'This is <%= name %>', {layout: 'default', name: 'AAA'});
    template.page('b.md', 'This is <%= name %>', {layout: 'default', name: 'BBB'});
    template.page('c.md', 'This is <%= name %>', {layout: 'default', name: 'CCC'});
  });

  describe('when a collection name is specified:', function () {
    it('should render an array of template objects:', function (done) {

      template.render('pages', function (err, file) {
        if (err) return done(err);
        file[0].content.should.equal('This is AAA');
        file[1].content.should.equal('This is BBB');
        file[2].content.should.equal('This is CCC');
        done();
      });
    });
  });
});
