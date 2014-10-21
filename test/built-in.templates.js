/*!
 * engine <https://github.com/jonschlinkert/engine>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Engine = require('..');
var template = new Engine();


describe('default templates:', function () {
  it('should have `partial` and `partials` on the cache.', function () {
    template.should.have.property('partial');
    template.should.have.property('partials');
  });

  it('should have `page` and `pages` on the cache.', function () {
    template.should.have.property('page');
    template.should.have.property('pages');
  });

  it('should have `layout` and `layouts` on the cache.', function () {
    template.should.have.property('layout');
    template.should.have.property('layouts');
  });
});
