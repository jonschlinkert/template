var path = require('path');
var file = require('fs-utils');


exports.read = function(filepath) {
  return file.readFileSync(filepath);
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