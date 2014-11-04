/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var fs = require('fs');
var path = require('path');
var should = require('should');
var consolidate = require('consolidate');
var Template = require('..');
var template = new Template();


describe('.renderString()', function () {
  beforeEach(function (done) {
    template = new Template();
    done();
  });

  describe('when the name of a cached template is passed to `.renderString()`:', function () {
    it('should get engine to use from the `ext` property on locals:', function (done) {
      var locals = {name: 'Halle', ext: '.md'};
      template.renderString('abc <%= name %> xyz', locals, function (err, content) {
        if (err) console.log(err);
        content.should.equal('abc Halle xyz');
        done();
      });
    });
  });

  describe('engine render:', function () {
    it('should use the `engine` on the locals to determine the consolidate engine to use:', function (done) {
      template.engine('hbs', consolidate.handlebars);
      template.engine('swig', consolidate.swig);
      template.engine('tmpl', consolidate.lodash);

      var files = [
        ['<title>{{title}}</title>', {title: 'Handlebars', engine: 'hbs'}],
        ['<title><%= title %></title>', {title: 'Lo-Dash', engine: 'tmpl'}],
        ['<title>{{title}}</title>', {title: 'Swig', engine: 'swig'}]
      ];

      files.forEach(function(args) {
        var engine = args[1].engine;

        template.renderString(args[0], args[1], function (err, content) {
          if (err) console.log(err);

          if (engine === '.hbs') {
            content.should.equal('<title>Handlebars</title>');
          }
          if (engine === '.tmpl') {
            content.should.equal('<title>Lo-Dash</title>');
          }
          if (engine === '.swig') {
            content.should.equal('<title>Swig</title>');
          }
        });
      });

      done();
    });

    it('should use the `ext` on the locals to determine the consolidate engine to use:', function (done) {
      template.engine('hbs', consolidate.handlebars);
      template.engine('swig', consolidate.swig);
      template.engine('tmpl', consolidate.lodash);

      var files = [
        ['<title>{{title}}</title>', {title: 'Handlebars', ext: 'hbs'}],
        ['<title><%= title %></title>', {title: 'Lo-Dash', ext: 'tmpl'}],
        ['<title>{{title}}</title>', {title: 'Swig', ext: 'swig'}]
      ];

      files.forEach(function(args) {
        var engine = args[1].engine;

        template.renderString(args[0], args[1], function (err, content) {
          if (err) console.log(err);

          if (engine === '.hbs') {
            content.should.equal('<title>Handlebars</title>');
          }
          if (engine === '.tmpl') {
            content.should.equal('<title>Lo-Dash</title>');
          }
          if (engine === '.swig') {
            content.should.equal('<title>Swig</title>');
          }
        });
      });

      done();
    });
  });
});
