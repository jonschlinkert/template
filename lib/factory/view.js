'use strict';

function viewFactory (type, options) {
  options = options || {};
  var View = options.View || require('../view');
  var collection = options.collection;
  function Ctor(view) {
    if (typeof view.content === 'undefined' && Buffer.isBuffer(view.contents)) {
      view.content = view.contents.toString();
    }
    collection.set(view.path, view);
    return collection.get(view.path);
  }
  View.extend(Ctor);
  return Ctor;
}

module.exports = viewFactory;
