'use strict';

function fileFactory (type, options) {
  options = options || {};
  var File = options.File || require('../file');
  var collection = options.collection;
  var Ctor = function(file) {
    collection.set(file.path, file);
    return collection.get(file.path);
  }
  File.extend(Ctor);
  return Ctor;
}

module.exports = fileFactory;
