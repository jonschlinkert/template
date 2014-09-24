'use strict';

var chalk = require('chalk');

/**
 * Throw an error if `file` does not have `props`.
 *
 * @param  {String} `file` The object to test.
 * @api private
 */

exports.notify = function(type, name) {
  var msg = new Error(chalk.red('helper {{' + type + ' "' + name + '"}} not found.'));
  return console.log(msg);
};

