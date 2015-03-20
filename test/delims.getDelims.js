/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('./app');


describe('.getDelims():', function () {
  it('should use default built-in template:', function () {
    var template = new Template();

    template.useDelims('*');
    template.getDelims().should.eql({
      escape: /<%-([\s\S]+?)%>/,
      evaluate: /<%([\s\S]+?)%>/,
      interpolate: /<%=([\s\S]+?)%>/,
      layoutDelims: {
        escape: /{%-([\s\S]+?)%}/,
        evaluate: /{%([\s\S]+?)%}/,
        interpolate: /{%=([\s\S]+?)%}/,
        original: ['{%','%}']
      },
      original: ['<%', '%>']
    });
  });

  it('should allow default built-in template to be overridden:', function () {
    var template = new Template();

    template.addDelims('default', ['<<', '>>']);
    template.useDelims('default');
    template.getDelims().should.eql({
      escape: /<<-([\s\S]+?)>>/,
      evaluate: /<<([\s\S]+?)>>/,
      interpolate: /<<=([\s\S]+?)>>/,
      original: ['<<', '>>']
    });
  });

  it('should use the currently set template:', function () {
    var template = new Template();
    var ctx = {
      name: '____Jon Schlinkert____'
    };

    template.addDelims('lodash', ['<%', '%>']);
    template.addDelims('hbs', ['\\{{', '}}']);
    template.addDelims('square', ['\\[\\[', '\\]\\]']);

    // use `lodash`
    template.useDelims('lodash');
    template.getDelims().should.eql({
      escape: /<%-([\s\S]+?)%>/,
      evaluate: /<%([\s\S]+?)%>/,
      interpolate: /<%=([\s\S]+?)%>/,
      original: ['<%', '%>']
    });

    // use `square`
    template.useDelims('square');
    template.getDelims().should.eql({
      escape: /\[\[-([\s\S]+?)\]\]/,
      evaluate: /\[\[([\s\S]+?)\]\]/,
      interpolate: /\[\[=([\s\S]+?)\]\]/,
      original: ['\\[\\[', '\\]\\]']
    });

    // use `hbs`
    template.useDelims('hbs');
    template.getDelims().should.eql({
      escape: /\{{-([\s\S]+?)}}/,
      evaluate: /\{{([\s\S]+?)}}/,
      interpolate: /\{{=([\s\S]+?)}}/,
      original: ['\\{{', '}}']
    });
  });
});
