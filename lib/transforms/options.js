'use strict';

/**
 * Load templates defined on the options.
 */

module.exports = function (app) {
  templates(app);
  helpers(app);
};

function templates(app) {
  var keys = Object.keys(app.views);
  var len = keys.length;
  while (len--) {
    var key = keys[len];
    if (app.options.hasOwnProperty(key)) {
      app[key](app.options[key]);
    }
  }
}

function helpers(app) {
  if (app.options.hasOwnProperty('helpers')) {
    app.helpers(app.options.helpers);
  }
}
