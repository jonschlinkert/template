/*!
 * layouts <https://github.com/jonschlinkert/layouts>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('..');


describe('.render():', function () {
  describe('when layouts are defined as objects:', function () {
    var template = new Template();

    template.layout({a: { layout: 'b', content: 'A above\n{% body %}\nA below' }});
    template.layout({b: { layout: 'c', content: 'B above\n{% body %}\nB below' }});
    template.layout({c: { layout: 'd', content: 'C above\n{% body %}\nC below' }});
    template.layout({d: { layout: 'e', content: 'D above\n{% body %}\nD below' }});
    template.layout({last: { layout: undefined, content: 'last!\n{% body %}\nlast!' }});
    template.layout({e: { layout: 'f', content: 'E above\n{% body %}\nE below' }});
    template.layout({f: { layout: 'last', content: 'F above\n{% body %}\nF below' }});
    template.layout({first: { layout: 'a', content: '{% body %}' }});

    var expected = [
      'last!',
      'F above',
      'E above',
      'D above',
      'C above',
      'B above',
      'A above',
      'fooo',
      'A below',
      'B below',
      'C below',
      'D below',
      'E below',
      'F below',
      'last!'
    ].join('\n');

    it('should render content into a layout.', function (done) {
      // console.log('templates._layouts', template._layouts);
      template.render({content: 'fooo', layout: 'first'}, function(err, content) {
        if (err) return done(err);
        content.should.equal(expected);
        done();
      });
    });
  });

  // describe('when layouts are defined with string values:', function () {
  //   var layouts = new Template();

  //   template.layout('first', 'a', '{{body}}');
  //   template.layout('a', 'b', 'A above\n{{body}}\nA below');
  //   template.layout('b', 'c', 'B above\n{{body}}\nB below');
  //   template.layout('c', 'd', 'C above\n{{body}}\nC below');
  //   template.layout('d', 'e', 'D above\n{{body}}\nD below');
  //   template.layout('e', '', 'E above\n{{body}}\nE below');
  //   template.layout('last', undefined, 'last!\n{{body}}\nlast!');

  //   it('should extend the `cache`.', function () {
  //     var actual = template.render('Last! {{body}}', 'first');
  //     var expected = [
  //       'E above',
  //       'D above',
  //       'C above',
  //       'B above',
  //       'A above',
  //       'Last! {{body}}', // last {{body}} tag should be unrendered
  //       'A below',
  //       'B below',
  //       'C below',
  //       'D below',
  //       'E below'
  //     ].join('\n');
  //     actual.content.should.eql(expected);
  //   });
  // });
});
