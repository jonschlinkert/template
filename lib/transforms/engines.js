'use strict';

var engine = require('engine-lodash');

/**
 * Load default engines. The default engine, [engine-lodash]
 * will process templates in any files with the `.md` extension.
 * To change or negate these extensions, just do:
 *
 * ```js
 * engine.option('defaultExts', 'md');
 * // or an array of extensions
 * engine.option('defaultExts', ['hbs', 'md']);
 * ```
 * @name default engines
 * @api public
 */

module.exports = function (template) {
  if (!template.disabled('default engines')) {
    template.engine(['*', 'md'], engine, {
      layoutDelims: template.option('layoutDelims'),
      destExt: template.option('destExt')
    });
  }
}
