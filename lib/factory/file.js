'use strict';

function fileFactory (type, options) {
  options = options || {};
  var File = options.File || require('../file');
  var collection = options.collection;
  function Ctor(file) {
    if (typeof file.content === 'undefined' && Buffer.isBuffer(file.contents)) {
      file.content = file.contents.toString();
    }
    collection.set(file.path, file);
    return collection.get(file.path);
  }
  File.extend(Ctor);
  return Ctor;
}

module.exports = fileFactory;
