var fs = require('fs');
var path = require('path');

var _ = require('lodash');
_.str = require('underscore.string');
_.mixin(_.str.exports());

exports.read = function(filepath) {
  return fs.readFileSync(filepath, 'utf8');
};


exports.data = {
  name: 'Jon',
  person: {name: 'Jon', first: {name: 'Jon'} },
  fn: function(val) {
    return val || "FUNCTION!";
  },
  two: {
    three: function(val) {
      return val || "THREE!!";
    }
  }
};



exports.data.lower = function(str) {
  return str.toLowerCase();
};
exports.data.upper = function(str) {
  return str.toUpperCase();
};

exports.data.include = function (filepath) {
  return exports.read(filepath);
};

exports.data.getVal = function(val) {
  return val || 'DEFAULT!';
};

module.exports = exports;