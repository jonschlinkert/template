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


describe('template.process()', function () {
  beforeEach(function() {
    template = new Template();
    template.omit('abcdefghijklmnopqrstuvwxyz'.split(''));
  });

  describe('.process()', function () {
    it('should resolve template strings in config values', function () {
      var store = template.process({a: '<%= b %>', b: 'c'});
      store.a.should.equal('c')
    });

    it('should process the cache when no arguments are passed', function () {
      template.data({a: '${b}', b: '${c}', c: 'DONE'});
      template.get('data.a').should.equal('${b}');

      template.get('data.b').should.equal('${c}');
      template.get('data.c').should.equal('DONE');

      template.process();

      template.get('data.a').should.equal('DONE');
      template.get('data.b').should.equal('DONE');
      template.get('data.c').should.equal('DONE');
    });

    it('should resolve es6 template strings in config values', function () {
      var store = template.process({a: '${b}', b: 'c'});
      store.a.should.equal('c');
    });

    it('should recursively resolve template strings.', function () {
      var store = template.process({
        a: '${b}',
        b: '${c}',
        c: '${d}',
        d: '${e.f.g}',
        e: {f:{g:'h'}}});
      store.a.should.equal('h');
    });

    describe('when functions are defined on the config', function() {
      it('should used them on config templates', function() {
        template.set({
          upper: function (str) {
            return str.toUpperCase();
          }
        });

        template.set({fez: 'bang', pop: 'boom-pow!'});
        template.set({whistle: '<%= upper(fez) %>-<%= upper(pop) %>'});
        template.get('whistle').should.equal('<%= upper(fez) %>-<%= upper(pop) %>');

        var a = template.process(template.get('whistle'), template.get());
        a.should.equal('BANG-BOOM-POW!');

        var b = template.process(template.get(), template.get());
        b.whistle.should.equal('BANG-BOOM-POW!');
      });
    });
  });
});
