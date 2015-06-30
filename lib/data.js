
var util = require('util');
var Base = require('./base');

function Data(cache) {
  Base.apply(this, arguments);
}
util.inherits(Data, Base);

Data.prototype.extend = function(key, val) {

};

/**
 * Expose `Data`
 */

module.exports = Data;
