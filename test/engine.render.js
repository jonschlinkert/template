/*!
 * view-cache <https://github.com/jonschlinkert/view-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var fs = require('fs');
var path = require('path');
var should = require('should');
var Template = require('..');
var template = new Template();

describe('engine render:', function () {
  it('should render a file with the specified engine:', function (done) {
    var lodash = template.getEngine('md');

    lodash.render('<%= name %>', {name: 'Jon Schlinkert'}, function (err, content) {
      if (err) console.log(err);
      content.should.equal('Jon Schlinkert');
      done();
    });
  });

  it('should render a file using helpers passed to an engine.', function(done) {
    var lodash = template.getEngine('md');
    var ctx = {
      name: 'Jon Schlinkert',
      imports: {
        include: function(name) {
          var filepath = path.join('test/fixtures', name);
          return fs.readFileSync(filepath, 'utf8');
        },
        upper: function(str) {
          return str.toUpperCase()
        }
      }
    };

    lodash.render('<%= upper(include("content.tmpl")) %>', ctx, function (err, content) {
      if (err) console.log(err);
      content.should.equal('JON SCHLINKERT');
      done();
    });
  });
});
