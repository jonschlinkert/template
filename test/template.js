/*!
 * view-cache <https://github.com/jonschlinkert/view-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('..');
var _ = require('lodash');


describe('.create():', function () {

  it('should create a new template `type`:', function () {
    var template = new Template();
    template.create('include', 'includes');
    template.include('foo', 'bar');

    // console.log(template.cache)

    template.should.have.property('include');
    template.should.have.property('includes');
  });
});
