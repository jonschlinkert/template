'use strict';

/**
 * Expose `utils`
 */

var utils = module.exports;



utils.setProto = function setProto(obj, proto) {
  return Object.setPrototypeOf
    ? Object.setPrototypeOf(obj, proto)
    : (obj.__proto__ = proto);
};


utils.protoTree = function protoTree(obj) {
  var tree = {};
  do {
    var name = obj.constructor.name;
    if (name !== 'Object') {
      tree[name] = Object.getOwnPropertyNames(obj);
    }
  } while (obj = Object.getPrototypeOf(obj));
  return tree;
};

utils.nativeKeys = function nativeKeys(obj) {
  return Object.getOwnPropertyNames(obj.constructor);
};

utils.observe = function observe(obj) {
  Object.observe(obj, function(changes) {
    changes.forEach(function (change) {
      // console.log(change)
    });
  });
};
