'use strict';

function viewFactory (type, options) {
  options = options || {};
  var View = options.View || require('../view');
  var collection = options.collection;
  var Ctor = function(view) {
    collection.set(view.path, view);
    return collection.get(view.path);
  }
  View.extend(Ctor);
  return Ctor;
}

module.exports = viewFactory;
