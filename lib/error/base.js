
/**
 * Set an error message that will either `throw`, or be pushed onto
 * `errorsList` when `silent` is enabled.
 *
 * ```js
 * this.error('Error parsing string.');
 * ```
 *
 * @param {String} `methodName` The name of the method where the error is thrown.
 * @param {String} `msg` Message to use in the Error.
 * @param {Object} `file` The `value` of a template object
 */

function error(method, message, args) {
  this.errorsList = this.errorsList || [];

  var msg = 'Template#' + method;
  msg += ': ' + message;
  msg += args ? (': ' + args) : '';

  var err = new Error(msg);
  err.reason = msg;
  err.method = method;
  err.msg = message;
  err.args = args;

  this.errorsList.push(err);
  return err;
}

/**
 * Expose `BaseError`
 */
module.exports = error;

