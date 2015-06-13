/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

require('should');
var extend = require('extend-shallow');
var consolidate = require('consolidate');
var Template = require('./app');
var template;

describe('engineHelpers().addHelper():', function () {
  beforeEach(function () {
    template = new Template();
    template.engine('md', consolidate.lodash);
  });

  it('should register _bound_ helper functions by default:', function () {
    var helpers = template.engineHelpers('*');
    helpers.addHelper('a', function () {});
    helpers.addHelper('b', function () {});

    helpers.should.have.properties(['a', 'b']);
  });

  it('should register _un-bound_ helpers when `bindHelpers` is false:', function () {
    template.disable('bindHelpers');
    var helpers = template.engineHelpers('*');

    helpers.addHelper('a', function () {});
    helpers.addHelper('b', function () {});
    helpers.should.have.properties(['a', 'b']);
  });

  it('should use helpers in templates:', function (done) {
    template.disable('bindHelpers');
    var helpers = template.engineHelpers('md');

    helpers.addHelper('upper', function (str) {
      return str.toUpperCase();
    });

    var lodash = template.getEngine('md');
    var ctx = extend({imports: lodash.helpers}, {name: 'Halle Nicole'});

    lodash.render('<%= upper(name) %>', ctx, function (err, content) {
      if (err) console.log(err);
      content.should.equal('HALLE NICOLE');
      done();
    });
  });
});
