// /*!
//  * template <https://github.com/jonschlinkert/template>
//  *
//  * Copyright (c) 2014 Jon Schlinkert, contributors
//  * Licensed under the MIT License (MIT)
//  */

// 'use strict';

// var assert = require('assert');
// var should = require('should');
// var Template = require('..');
// var _ = require('lodash');


// describe('render page:', function () {
//   it('should determine the engine from the `path` on the given object:', function (done) {
//     template.page({path: 'a/b/c.md', content: '<%= name %>', name: 'Jon Schlinkert'});

//     template.render(file, function (err, content) {
//       if (err) console.log(err);
//       content.should.equal('Jon Schlinkert');
//       done();
//     });
//   });

//   it('should determine the engine from the `path` on the given object:', function (done) {
//     template.page({path: 'a/b/c.md', content: '<%= name %>'});

//     template.render(file, {name: 'Jon Schlinkert'}, function (err, content) {
//       if (err) console.log(err);
//       content.should.equal('Jon Schlinkert');
//       done();
//     });
//   });


//   it('should use `file.path` to determine the correct consolidate engine to render content:', function (done) {
//     template.engine('hbs', consolidate.handlebars);
//     template.engine('jade', consolidate.jade);
//     template.engine('swig', consolidate.swig);
//     template.engine('tmpl', consolidate.lodash);

//     template.page({path: 'fixture.hbs', content: '<title>{{author}}</title>', author: 'Jon Schlinkert'});
//     template.page({path: 'fixture.tmpl', content: '<title><%= author %></title>', author: 'Jon Schlinkert'});
//     template.page({path: 'fixture.jade', content: 'title= author', author: 'Jon Schlinkert'});
//     template.page({path: 'fixture.swig', content: '<title>{{author}}</title>', author: 'Jon Schlinkert'});

//     console.log(template)

//     // files.forEach(function(file) {
//     //   template.render(file, function (err, content) {
//     //     if (err) console.log(err);
//     //     content.should.equal('<title>Jon Schlinkert</title>');
//     //   });
//     // });

//     done();
//   });
// });
