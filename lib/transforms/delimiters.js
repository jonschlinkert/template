'use strict';

/**
 * Register default template delimiters.
 *
 *   - engine delimiters: Delimiters used in templates process
 *     by [engine-lodash], the default engine.
 *   - layout delimiters: Delimiters used in layouts.
 *
 * @api private
 */

module.exports = function (template) {
  template.addDelims('*', ['<%', '%>'], ['{%', '%}']);
};
