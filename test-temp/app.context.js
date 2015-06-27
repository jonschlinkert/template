/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

/* deps: mocha load-templates handlebars */
var should = require('should');
var Template = require('./app');
var template;

describe('app context', function() {
  beforeEach(function() {
    template = new Template();
  });

  describe('context:', function () {
    it('should pass data to templates in the `.render()` method:', function (done) {
      template.data({ abc: 'xyz'});
      template.page('aaa.md', '<%= abc %>');

      template.render('aaa.md', function (err, content) {
        if (err) console.log(err);
        content.should.equal('xyz');
        done();
      });
    });

    it('should pass data to templates in the `.render()` method:', function () {
      template.data({ letter: 'b'});
      template.page('aaa.md', 'a<%= letter %>c');
      template.render('aaa.md').should.equal('abc');
    });

    it('should give preference to locals over "global" data:', function () {
      template.data({ letter: 'b'});
      template.page('aaa.md', 'a<%= letter %>c', { letter: 'bbb'});
      template.render('aaa.md').should.equal('abbbc');
    });

    it('should give preference to front matter over locals:', function () {
      template.data({ letter: 'b'});
      template.page('aaa.md', '---\nletter: zzz\n---\na<%= letter %>c', { letter: 'bbb'});
      template.render('aaa.md').should.equal('azzzc');
    });

    describe('when `options.preferLocals` is defined:', function () {
      it('should give preference to locals over front matter:', function () {
        template.enable('preferLocals');
        template.data({ letter: 'b'});
        template.page('aaa.md', '---\nletter: zzz\n---\na<%= letter %>c', { letter: 'bbb'});
        template.render('aaa.md').should.equal('abbbc');
      });
    });
  });
});
