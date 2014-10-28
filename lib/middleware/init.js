/**
 * Initialization middleware
 *
 * @param {Function} `engine`
 * @return {Function}
 * @api private
 */

module.exports = function(engine){
  return function engineInit(file, next){
    // this is a placeholder for when we need to add additional functionality to a `file` object.
    next();
  };
};

