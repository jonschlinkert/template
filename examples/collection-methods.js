'use strict';

function CollectionMethods (views) {
  if (views) {
    this.views = views;
  }
  Object.defineProperty(this, '_views', {
    enumerable: false,
    configurable: false,
    get: function () {
      return this.views || this;
    }
  });
}

CollectionMethods.prototype = {
  get: function (key) {
    return this._views[key];
  },

  set: function (key, value) {
    return (this._views[key] = value);
  },

  filter: function (name, key) {
    if (!this.cache) this.defineProp('cache', {});
    this.cache[name] = this.cache[name] || {};
    this.cache[name][key] = this._views[key];
    return this;
  },

  value: function (name, flush) {
    var vals = this.cache[name];
    if (flush) this.flush(name);
    return vals;
  },

  flush: function (name) {
    this.cache[name] = null;
    return this;
  },

  defineProp: function (name, value) {
    Object.defineProperty(this, name, {
      enumerable: false,
      configurable: true,
      get: function () { return value; },
      set: function (val) { val = value; }
    });
  }
};

function Collection () {}

function App () {
  this.views = {};
  var pages = new Collection();
  pages.__proto__ = new CollectionMethods(pages);
  this.pages = function (key, value) {
    pages.set(key, value);
  };
  this.pages.__proto__ = new CollectionMethods(pages);
  this.views['pages'] = pages;
}

App.prototype.forEach = function(name, fn) {
  for (var key in this.views[name]) {
    fn(key, this.views[name][key], this.views[name]);
  }
};

var app = new App();

// var collection = new Collection();
// collection.__proto__ = CollectionMethods.prototype;

app.pages('a', 'a');
app.pages('b', 'b');
app.pages('c', 'c');
app.pages('d', 'd');
app.pages('e', 'e');

console.log(app.pages);
for(var key in app.pages) {
  console.log(key, app.pages.hasOwnProperty(key));
}
console.log();
console.log(app.pages._views);
for(var key in app.pages._views) {
  console.log(key, app.pages._views.hasOwnProperty(key));
}
console.log();

app.forEach('pages', function (key, value, pages) {
  console.log(key, pages.hasOwnProperty(key));
});

var a = app.pages.filter('a', 'a');
var b = app.pages.filter('b', 'b');
console.log(app.pages);
console.log(a, app.pages.value('a'));
console.log(a, app.pages.value('a'));
console.log(b, app.pages.value('b', true));
console.log(b, app.pages.value('b', true));

var aa = app.views.pages.filter('aa', 'a');
var bb = app.views.pages.filter('bb', 'b');
console.log(app.views.pages);
console.log(aa, app.views.pages.value('aa'));
console.log(bb, app.views.pages.value('bb'));
