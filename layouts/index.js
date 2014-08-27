/*!
 * layouts <https://github.com/jonschlinkert/layouts>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var util = require('util');
var isFalsey = require('falsey');
var Cache = require('config-cache');
var _ = require('lodash');
var delims = new (require('delims'))();

/**
 * Create a new instance of `Layouts`, optionally passing the default
 * `cache` and `options` to use.
 *
 * **Example:**
 *
 * ```js
 * var Layouts = require('layouts');
 * var layouts = new Layouts();
 * ```
 *
 * @param {Object} `cache` A template cache. See [Layouts#set](#set) for object details.
 * @param {Object} `options` Options to use.
 * @param {Array} `options.delims` Template delimiters to use formatted as an array (`['{{', '}}']`)
 * @param {String} `options.tag` The tag name to use. Default is `body` (e.g. `{{ body }}`)
 */

function Layouts(options) {
  Cache.call(this, options);
  this.init(options);
}

util.inherits(Layouts, Cache);


/**
 * Initialize defaults.
 *
 * @api private
 */

Layouts.prototype.init = function (options) {
  this.options = _.extend({}, options);
  this._extendMethod = this.options.extend || _.extend;

  // Create the default `{{ body }}` tag
  this.defaultTag = this.makeTag(this.options);

  var o = {};
  _.extend(o, this.options.cache);
  _.extend(o, this.options.layouts);
  _.extend(o, this.cache.data);

  // Clean up properties from user options.
  delete this.options.cache;
  delete this.cache.data;
  this.extend(o);

  // Init the context using any locals pass on `options`
  this.context = _.extend({}, this.options.locals);
  // flatten nested `cache` objects
  this.flattenData(this.cache, 'cache');
};


/**
 * Generate the default body tag to use as a fallback, based on the
 * `tag` and `delims` defined in the options.
 *
 * @param  {Object} options
 * @return {String} The actual body tag, e.g. `{{ body }}`
 * @api private
 */

Layouts.prototype.makeTag = function (options) {
  var opts = _.extend({}, this.options, options);
  opts.delims = opts.delims || ['{{', '}}'];
  opts.tag = opts.tag || 'body';

  return [
    opts.delims[0],
    opts.tag,
    opts.delims[1]
  ].join(opts.sep || ' ');
};


/**
 * Return a regular expression for the "body" tag based on the
 * `tag` and `delims` defined in the options.
 *
 * @param  {Object} `options`
 * @return {RegExp}
 * @api private
 */

Layouts.prototype.makeRegex = function (options) {
  var opts = _.extend({sep: '\\s*'}, this.options, options);
  var tag = this.makeTag(opts).replace(/[\]()[{|}]/g, '\\$&');
  return new RegExp(tag, opts.flags || 'g');
};


/**
 * Store a template on the cache by its `name`, the `layout` to use,
 * and the template's `content.
 *
 * **Example:**
 *
 * ```js
 * layouts.setLayout('a', 'b', '<h1>Foo</h1>\n{{body}}\n');
 * ```
 *
 * @param {String|Object} `name` If `name` is a string, `layout` and `content` are required.
 * @param {String|Object} `data` Pass a string defining the name of layout to use for the given
 *                               template, or pass an object with a `layout` property.
 * @param {String} `content` The template "content", this will not be compiled or rendered.
 * @api public
 */

Layouts.prototype.setLayout = function (name, data, content) {
  if (arguments.length === 1 && typeof name === 'object') {
    this.cache = _.extend({}, this.cache, name);
    return this;
  }
  this.cache[name] = {
    layout: (data && data.layout) ? data.layout : data,
    content: (data && data.content) ? data.content : content,
    data: data
  };

  return this;
};


/**
 * Define the default layout variable and delimiters to be used.
 *
 * @api private
 */

Layouts.prototype._defaultLayout = function (context, options) {
  var opts = _.extend({}, options);
  var tag = (this.makeTag(options) || this.defaultTag).replace(/\s/g, '');

  var variable = options.tag || 'body';
  var settings = _.extend(delims.templates(options.delims || ['{{','}}']), options);

  settings.interpolate = settings.evaluate;

  return {
    variable: tag,
    context: opts,
    settings: settings
  };
};


/**
 * Get a cached template by `name`.
 *
 * **Example:**
 *
 * ```js
 * layouts.getLayout('a');
 * //=> { layout: 'b', content: '<h1>Foo</h1>\n{{body}}\n' }
 * ```
 *
 * @param  {String} `name`
 * @return {Object} The template object to return.
 */

Layouts.prototype.getLayout = function (name) {
  if (!name) {
    return this.cache;
  }
  return this.cache[name];
};


/**
 * Assert whether or not a layout should be used based on
 * the given `value`. If a layout should be used, the name of the
 * layout is returned, if not `null` is returned.
 *
 * @param  {*} `value`
 * @return {String|Null} Returns `true` or `null`.
 * @api private
 */

Layouts.prototype.assertLayout = function (value, defaultLayout) {
  if (value === false || (value && isFalsey(value))) {
    return null;
  } else if (!value || value === true) {
    return defaultLayout || null;
  } else {
    return value;
  }
};


/**
 * Extend `data` with the given `obj. A custom `_extendMethod` can be
 * passed on `options.extend` to change how data is merged.
 *
 * @param  {Object} `opts` Pass an options object with `data` or `locals`
 * @return {Object} `file` A `file` to with `data` to be merged.
 * @api private
 */

Layouts.prototype._mergeData = function (opts, file) {
  var data = {};

  // build up the `data` object
  _.extend(data, opts, opts.locals, opts.data);
  _.extend(data, file, file.data);

  // Flatten nested `data` objects
  this.flattenData(data);

  // Extend the context
  this._extendMethod(this.context, _.omit(data, [
    'extend',
    'content',
    'delims',
    'layout'
  ]));

  return this;
};


/**
 * Build a layout stack.
 *
 * @param  {String} `name` The name of the layout to add to the stack.
 * @param  {Object} `options` Options to pass to `assertLayout`.
 * @return {Array}
 * @api private
 */

Layouts.prototype.createStack = function (name, options) {
  var opts = _.extend({}, this.options, options);
  name = this.assertLayout(name, opts.defaultLayout);

  var template = {};
  var stack = [];
  var prev = null;

  while (name && (prev !== name) && (template = this.cache[name])) {
    stack.unshift(name);
    prev = name;
    var layout = template.layout || (template.data && template.data.layout);
    name = this.assertLayout(layout, opts.defaultLayout);
  }

  return stack;
};


/**
 * Reduce a layout stack for a template into a single flattened
 * layout. Pass the `name` of the layout defined for the template
 * (e.g. the first layout in the stack).
 *
 * **Example:**
 *
 * ```js
 * layouts.stack('base');
 * ```
 *
 * @param  {String} `name` The layout to start with.
 * @param  {Object} `options`
 * @return {Array} The file's layout stack is returned as an array.
 * @api private
 */

Layouts.prototype.stack = function (name, options) {
  var stack = this.createStack(name, options);
  var opts = _.extend(this.options, options);

  var tag = this.makeTag(opts) || this.defaultTag;
  this.regex = this.makeRegex(opts);

  return _.reduce(stack, function (acc, layout) {
    var content = acc.content || tag;
    var tmpl = this.cache[layout];

    var data = this._mergeData(opts, tmpl);
    content = content.replace(this.regex, tmpl.content);
    content = this.renderLayout(content, data, opts);

    return {
      data: this.context,
      content: content,
      regex: this.regex,
      tag: tag
    };
  }.bind(this), {});
};


/**
 * Render a layout using Lo-Dash, by passing content (`str`), `context`
 * and `options`.
 *
 * **Example:**
 *
 * ```js
 * layouts.renderLayout(str, context, options);
 * ```
 *
 * Since this method uses Lo-Dash to process templates custom delimiters
 * may be passed on the `options.delims` property. This allows layouts to
 * be rendered prior to injecting "pages" or other str with templates that
 * _should not_ be rendered when the layout stack is processed.
 *
 * **Example:**
 *
 * ```js
 * layouts.renderLayout(str, context, {
 *   delims: ['<%','%>']
 * });
 * ```
 *
 * @param  {String} `str` Content for the layout to render.
 * @param  {Object} `options` Additional options used for building the render settings.
 * @return {String} Rendered string.
 */

Layouts.prototype.renderLayout = function (str, context, options) {
  var layout = this._defaultLayout(context, options);

  var ctx = _.extend({}, context, this.context, {
    body: layout.variable
  });

  return _.template(str, ctx, layout.settings);
};


/**
 * Replace a `{{body}}` tag with the given `str`. Custom delimiters
 * and/or variable may be passed on the `options`. Unlike `renderLayout`,
 * this method does not render templates, it only peforms a basic regex
 * replacement.
 *
 * **Example:**
 *
 * ```js
 * layouts.replaceTag('ABC', 'Before {{body}} After');
 * //=> 'Before ABC After'
 * ```
 *
 * @param  {String} `str` The string to use as a replacement value.
 * @param  {String} `content` A string with a `{{body}}` tag where the `str` should be injected.
 * @return {String} Resulting flattened content.
 * @api public
 */

Layouts.prototype.replaceTag = function (str, content, options) {
  return content.replace(this.makeRegex(options), str);
};


/**
 * Return an object with the string (`str`) and `data` required
 * to build a final layout. This is useful if you need to use
 * your own template engine to handle this final step.
 *
 * **Example:**
 *
 * ```js
 * var page = layouts.render(str, 'base');
 * var tmpl = _.template(page, context);
 * ```
 *
 * @param  {String} `str` The string to be injected into the layout. Usually a page, or inner layout, etc.
 * @param  {String} `name` The name of the first layout to use to build the stack.
 * @return {Object} Resulting flattened layout.
 * @api public
 */

Layouts.prototype.render = function (str, name, options) {
  var layout = this.stack(name, options);

  if (layout.content) {
    str = layout.content.replace(this.regex, str);
  }
  return {data: layout.data, content: str};
};


module.exports = Layouts;
