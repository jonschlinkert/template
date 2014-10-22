/*!
 * engine <https://github.com/jonschlinkert/engine>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var should = require('should');
var Engine = require('..');
var engine;


describe('context', function() {
  beforeEach(function() {
    engine = new Engine();
  });

  describe('context:', function () {
    it('should pass data to templates in the `.render()` method:', function (done) {
      engine.data({ abc: 'xyz'});
      engine.page('aaa.md', '<%= abc %>');

      engine.render('aaa.md', function (err, content) {
        if (err) console.log(err);
        content.should.equal('xyz');
        done();
      });
    });

    it('should pass data to templates in the `.renderSync()` method:', function () {
      engine.data({ letter: 'b'});
      engine.page('aaa.md', 'a<%= letter %>c');
      engine.renderSync('aaa.md').should.equal('abc');
    });

    it('should give preference to locals over "global" data:', function () {
      engine.data({ letter: 'b'});
      engine.page('aaa.md', 'a<%= letter %>c', { letter: 'bbb'});
      engine.renderSync('aaa.md').should.equal('abbbc');
    });

    it('should give preference to front matter over locals:', function () {
      engine.data({ letter: 'b'});
      engine.page('aaa.md', '---\nletter: zzz\n---\na<%= letter %>c', { letter: 'bbb'});
      engine.renderSync('aaa.md').should.equal('azzzc');
    });

    describe('when `options.preferLocals` is defined:', function () {
      it('should give preference to locals over front matter:', function () {
        engine.option('preferLocals', true);
        engine.data({ letter: 'b'});
        engine.page('aaa.md', '---\nletter: zzz\n---\na<%= letter %>c', { letter: 'bbb'});
        engine.renderSync('aaa.md').should.equal('abbbc');
      });
    });
  });
});
