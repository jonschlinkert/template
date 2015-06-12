/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

require('should');
var Template = require('..');
var template = new Template();


describe('default templates:', function () {
  it('should have `partial` and `partials` on the cache.', function () {
    template.should.have.properties(['partial', 'partials']);
  });

  it('should have `page` and `pages` on the cache.', function () {
    template.should.have.properties(['page', 'pages']);
  });

  it('should have `layout` and `layouts` on the cache.', function () {
    template.should.have.properties(['layout', 'layouts']);
  });
});
