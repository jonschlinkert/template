var fs = require('fs');
var path = require('path');
var emmet = require('emmet');
var prettify = require('js-beautify').html;
var tabStops = require('emmet/lib/assets/tabStops');
var resources = require('emmet/lib/assets/resources');
var parser = require('emmet/lib/parser/abbreviation');
var _ = require('lodash');


function Snippets(cache) {
  this.cache = cache || {};
}

Snippets.prototype.set = function (key, value) {
  if (typeof key === 'object') {
    this.cache = _.extend({}, this.cache, key);
  } else {
    this.cache[key] = value;
  }
  emmet.loadSnippets(this.cache);
  return this;
};

Snippets.prototype.get = function (key) {
  if (!key) {
    return this.cache;
  }
  return this.cache[key];
};

Snippets.prototype.expand = function (abbr, options) {
  var opts = _.extend({
    profile: 'plain'
  }, options);

  var expanded = parser.expand(abbr, opts);
  // console.log('expanded', expanded);
  // console.log();

  var html = tabStops.processText(expanded, opts);
  // console.log('html', html);
  // console.log();
  if (opts.prettify) {
    return this.prettify(html, opts);
  }
  return html;
};

Snippets.prototype.prettify = function (html, options) {
  return prettify(html, _.extend({
    indent_handlebars: true,
    indent_inner_html: true,
    preserve_newlines: false,
    max_preserve_newlines: 1,
    brace_style: 'expand',
    indent_char: ' ',
    indent_size: 2,
  }, options));
};

module.exports = Snippets;

var snip = function (name) {
  return require(path.resolve('lib', name));
};

var snippets = new Snippets();
snippets.set({
  'variables': {
    'foo': 'bar'
  },
  'html': {
    'abbreviations': {
      'jq': '<scr' + 'ipt type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js"></scr' + 'ipt>',
      'demo': '<div id="demo"></div>',
      'nav': 'ul.nav>li*>a',
      'al': '<a !href="http://|">',
      'f1|f2': '<demo>'
    },
    'snippets': {
      "for": "for (var ${class} = 0; ${class} < ${id}.length; ${class}++) {\n\s|}",
      'dol': '\\$db->connect()\n\s\\$\\$\\$more dollaz$',
      'erb': '<%= |${child} %>',
      'beep': '${foo} - ${1:boop}',

      // create an each loop
      'each': '${1:#each page}|${child}${2:/each}'
    }
  },
  'xml': {
    'abbreviations': {
      'use': '<use xlink:href=""/>'
    }
  }
});
// snippets.load(snip('foundation.js'));

// use custom delims
var delims = ['{{', '}}'];

var options = {
  prettify: true,
  tabstop: function (data) {
    // console.log('tabstop data', data);
    if (data.placeholder) {
      // wrap the placeholder with delims
      return delims[0] + data.placeholder + delims[1];
    }
    return '';
  },
  variable: function (data) {
    // console.log('variable data', data);
    return data.token;
  }
};

console.log(snippets.expand('zf-head', {prettify: true}));
console.log(snippets.expand('each{{{this.title}}}', options));