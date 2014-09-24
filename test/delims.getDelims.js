/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('../tmpl');
var _ = require('lodash');


describe('.useDelims():', function () {
  it('should use default built-in template:', function () {
    var template = new Template();

    template.useDelims('*');
    template.getDelims().should.eql({
      beginning: '',
      matter: '([\\s\\S]+?)',
      body: '',
      end: '',
      flags: 'g',
      noncapture: false,
      escape: /\<\%-([\s\S]+?)\%\>/g,
      open: '\\<\\%',
      close: '\\%\\>',
      delims: ['<%', '%>'],
      evaluate: /\<\%([\s\S]+?)\%\>/g,
      interpolate: /\<\%=([\s\S]+?)\%\>/g
    });
  });

  it('should allow default built-in template to be overridden:', function () {
    var template = new Template();

    template.addDelims('default', ['<<', '>>']);
    template.useDelims('default');
    template.getDelims().should.eql({
      beginning: '',
      matter: '([\\s\\S]+?)',
      body: '',
      end: '',
      flags: 'g',
      noncapture: false,
      escape: /\<\<-([\s\S]+?)\>\>/g,
      open: '\\<\\<',
      close: '\\>\\>',
      delims: ['<<', '>>'],
      evaluate: /\<\<([\s\S]+?)\>\>/g,
      interpolate: /\<\<=([\s\S]+?)\>\>/g
    });
  });

  it('should use the currently set template:', function () {
    var template = new Template();

    var ctx = {
      name: '____Jon Schlinkert____'
    };

    template.addDelims('lodash', ['<%', '%>']);
    template.addDelims('hbs', ['{{', '}}']);
    template.addDelims('square', ['[[', ']]']);

    template.useDelims('lodash');
    template.getDelims().should.eql({
      beginning: '',
      matter: '([\\s\\S]+?)',
      body: '',
      end: '',
      flags: 'g',
      noncapture: false,
      escape: /\<\%-([\s\S]+?)\%\>/g,
      open: '\\<\\%',
      close: '\\%\\>',
      delims: ['<%', '%>'],
      evaluate: /\<\%([\s\S]+?)\%\>/g,
      interpolate: /\<\%=([\s\S]+?)\%\>/g
    });

    template.useDelims('square');
    template.getDelims().should.eql({
      beginning: '',
      matter: '([\\s\\S]+?)',
      body: '',
      end: '',
      flags: 'g',
      noncapture: false,
      escape: /\[\[-([\s\S]+?)\]\]/g,
      open: '\\[\\[',
      close: '\\]\\]',
      delims: ['[[', ']]'],
      evaluate: /\[\[([\s\S]+?)\]\]/g,
      interpolate: /\[\[=([\s\S]+?)\]\]/g
    });

    template.useDelims('hbs');
    template.getDelims().should.eql({
      beginning: '',
      matter: '([\\s\\S]+?)',
      body: '',
      end: '',
      flags: 'g',
      noncapture: false,
      escape: /\{\{-([\s\S]+?)\}\}/g,
      open: '\\{\\{',
      close: '\\}\\}',
      delims: ['{{', '}}'],
      evaluate: /\{\{([\s\S]+?)\}\}/g,
      interpolate: /\{\{=([\s\S]+?)\}\}/g
    });
  });
});
