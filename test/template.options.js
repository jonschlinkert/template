/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var assert = require('assert');
require('should');
var Template = require('./app');
var template;

describe('template options', function () {
  beforeEach(function () {
    template = new Template();
  });

  it('should store options defined on .create', function () {
    template.create('box', {layout: 'foo'});
    template.layout('a', '...');
    template.contexts.create.boxes.should.have.property('layout', 'foo');
  });

  it('should store options defined on `locals.options`', function () {
    template.layout('a', 'bbb{% body %}bbb', {options: {foo: 'bar'}});
    template.views.layouts.a.should.have.property('options');
    template.views.layouts.a.options.should.have.property('foo', 'bar');
  });

  it('should store options defined on `template.options`', function () {
    template.layout('a', 'bbb{% body %}bbb', {}, {foo: 'bar'});
    template.views.layouts.a.should.have.property('options');
    template.views.layouts.a.options.should.have.property('foo', 'bar');
  });

  it('should store options defined on `value.options`', function () {
    template.layout('a', {content: 'bbb{% body %}bbb', options: {foo: 'bar'}});
    template.views.layouts.a.should.have.property('options');
    template.views.layouts.a.options.should.have.property('foo', 'bar');
  });
});
