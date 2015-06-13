/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

require('should');
var Template = require('../');
var template;

describe('viewType', function () {
  beforeEach(function () {
    template = new Template();
  });

  it('should create a new view type:', function () {
    template.viewType('foo');
    template.viewTypes.should.have.property('foo');
  });

  it('should set a view type for a collection:', function () {
    template.viewType('renderable');
    template.create('posts', { viewType: 'renderable' });
    template.create('pages', { viewType: 'renderable' });
    template.viewTypes.renderable[0].should.equal('posts');
    template.viewTypes.renderable[1].should.equal('pages');
  });

  it('should set an array of view types for a collection:', function () {
    template.viewType('layout');
    template.viewType('renderable');
    template.create('pages', { viewType: ['renderable', 'layout'] });
    template.viewTypes.renderable[0].should.equal('pages');
    template.viewTypes.layout[0].should.equal('pages');
  });

  it('should store viewTypes on views options:', function () {
    template.viewType('whatever');
    template.viewType('renderable');
    template.create('page', { viewType: ['renderable', 'whatever'] });
    template.create('post', { viewType: ['renderable'] });
    template.options.views.pages.viewType.should.eql(['renderable', 'whatever']);
    template.options.views.posts.viewType.should.eql(['renderable']);
  });
});
