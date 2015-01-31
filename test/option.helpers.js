/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('..');
var template;

describe('.option():', function () {
  beforeEach(function () {
    template = new Template();
  });

  it('should use helpers on the global options:', function (done) {
    template.helpers({
      c: function(str) { return 'c-' + str + '-c'; },
      d: function(str) { return 'd-' + str + '-d'; }
    });
    template.option({
      helpers: {
        a: function(str) { return 'a-' + str + '-a'; },
        b: function(str) { return 'b-' + str + '-b'; }
      }
    });
    template.page('foo', { path: 'foo', content: 'A: <%= a(bar) %>\nB: <%= b(bar) %>\nC: <%= c(bar) %>\nD: <%= d(bar) %>' });
    template.options.helpers.should.have.properties('a', 'b');
    template._.helpers.should.have.properties('c', 'd');

    template.render('foo', { bar: 'this is a message' }, function (err, content) {
      if (err) return done(err);
      content.should.equal('A: a-this is a message-a\nB: b-this is a message-b\nC: c-this is a message-c\nD: d-this is a message-d');
      done();
    });

  });

  it('should use helpers passed to the render method:', function (done) {
    template.helpers({
      c: function(str) { return 'c-' + str + '-c'; },
      d: function(str) { return 'd-' + str + '-d'; }
    });
    template.page('foo', { path: 'foo', content: 'A: <%= a(bar) %>\nB: <%= b(bar) %>\nC: <%= c(bar) %>\nD: <%= d(bar) %>' });
    template._.helpers.should.have.properties('c', 'd');

    var locals = {
      bar: 'this is a message',
      options: {
        helpers: {
          a: function(str) { return 'A-' + str + '-A'; },
          b: function(str) { return 'B-' + str + '-B'; }
        }
      }
    };
    template.render('foo', locals, function (err, content) {
      if (err) return done(err);
      content.should.equal('A: A-this is a message-A\nB: B-this is a message-B\nC: c-this is a message-c\nD: d-this is a message-d');
      done();
    });
  });

  it('should use local helpers over global helpers:', function (done) {
    template.helpers({
      c: function(str) { return 'c-' + str + '-c'; },
      d: function(str) { return 'd-' + str + '-d'; }
    });
    template.option({
      helpers: {
        a: function(str) { return 'a-' + str + '-a'; },
        b: function(str) { return 'b-' + str + '-b'; }
      }
    });
    template.page('foo', { path: 'foo', content: 'A: <%= a(bar) %>\nB: <%= b(bar) %>\nC: <%= c(bar) %>\nD: <%= d(bar) %>' });
    template._.helpers.should.have.properties('c', 'd');

    var locals = {
      bar: 'this is a message',
      options: {
        helpers: {
          a: function(str) { return 'A-' + str + '-A'; },
          b: function(str) { return 'B-' + str + '-B'; },
          c: function(str) { return 'C-' + str + '-C'; },
          d: function(str) { return 'D-' + str + '-D'; }
        }
      }
    };
    template.render('foo', locals, function (err, content) {
      if (err) return done(err);
      content.should.equal('A: A-this is a message-A\nB: B-this is a message-B\nC: C-this is a message-C\nD: D-this is a message-D');
      done();
    });
  });
});
