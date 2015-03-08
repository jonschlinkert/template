'use strict';

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
  if (!template.context('default engines')) {
    return;
  }

  template.engine(['*', 'md'], require('engine-lodash'), {
    layoutDelims: template.context('layoutDelims'),
    destExt: template.context('destExt')
  });
}
