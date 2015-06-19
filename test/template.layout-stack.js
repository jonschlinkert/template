/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

require('should');
var Template = require('./app');
var template;

describe('layout stack:', function () {
  beforeEach(function() {
    template = new Template();
    template.engine('md', require('engine-lodash'));
    template.enable('frontMatter');
  });

  describe('options.layoutStack:', function () {
    it('should add the layout stack to options.layoutStack:', function (done) {

      template.layout({a: { layout: 'b', content: '---\ntitle: AAA\n---\nA above\n{% body %}\nA below' , locals: {aa: 'a'}}});
      template.layout({b: { layout: 'c', content: 'B above\n{% body %}\nB below' , locals: {bb: 'b'}}});
      template.layout({c: { layout: 'd', content: 'C above\n{% body %}\nC below' , locals: {cc: 'c'}}});
      template.layout({d: { layout: 'e', content: 'D above\n{% body %}\nD below' , locals: {dd: 'd'}}});
      template.layout({last: { layout: undefined, content: 'last!\n{% body %}\nlast!' , locals: {ee: 'last'}}});
      template.layout({e: { layout: 'f', content: 'E above\n{% body %}\nE below' , locals: {ff: 'e'}}});
      template.layout({f: { layout: 'last', content: 'F above\n{% body %}\nF below' , locals: {gg: 'f'}}});
      template.layout({first: { layout: 'a', content: '{% body %}' , locals: {hh: 'first'}}});
      template.page('about', 'This is the about page.', {layout: 'first'}, {ext: '.html', locals: {ii: 'xyz'}});

      var expected = [
        'last!',
        'F above',
        'E above',
        'D above',
        'C above',
        'B above',
        'A above',
        'This is the about page.',
        'A below',
        'B below',
        'C below',
        'D below',
        'E below',
        'F below',
        'last!'
      ].join('\n');

      var tmpl = template.pages.get('about');
      template.render(tmpl, function(err, content) {
        if (err) return done(err);

        // tmpl.options.should.have.property('layoutContext');
        // tmpl.options.should.have.property('layoutStack');
        content.should.equal(expected);
        done();
      });
    });
  });
});
