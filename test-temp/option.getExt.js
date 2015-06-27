/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var path = require('path');
var should = require('should');
var consolidate = require('consolidate');
var Template = require('./app');
var template;


describe('template.option()', function() {
  beforeEach(function (done) {
    template = new Template();
    template.engine('hbs', consolidate.handlebars);
    template.engine('swig', consolidate.swig);
    template.engine('tmpl', consolidate.lodash);
    done();
  });

  describe('when no `getExt` function is pass on the options:', function () {
    it('should use `path.extname()` on the template key to determine the engine to use:', function (done) {
      template.page('a.hbs', {content: '<title>{{title}}</title>', title: 'Handlebars'});
      template.page('b.tmpl', {content: '<title><%= title %></title>', title: 'Lo-Dash'});
      template.page('d.swig', {content: '<title>{{title}}</title>', title: 'Swig'});

      Object.keys(template.views.pages).forEach(function(name) {
        var ext = path.extname(name);

        template.render(name, function (err, content) {
          if (err) console.log(err);

          if (ext === '.hbs') {
            content.should.equal('<title>Handlebars</title>');
          }
          if (ext === '.tmpl') {
            content.should.equal('<title>Lo-Dash</title>');
          }
          if (ext === '.swig') {
            content.should.equal('<title>Swig</title>');
          }
        });
      });

      done();
    });
  });
});
