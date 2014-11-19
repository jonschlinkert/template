var handlebars = require('engine-handlebars');
var fs = require('fs');
var Template = require('../..');
var template = new Template();

template.enable('debugEngine');
template.engine('.hbs', handlebars);


// add a new template type 'apidoc' with a custom loader function
template.create('apidoc', [
  // add the docs to the pages collection and pass the keys along
  function (patterns, next) {
    var docs = [];
    template.pages(patterns, [function (pages, done) {
      docs = Object.keys(pages);
      done(null, pages);
    }], function (err) {
      next(null, docs);
    });
  },
  function (docs, next) {
    // render the pages so partials are added to the context through the helper
    docs.forEach(function (doc) {
      var page = template.cache.pages[doc];
      if (!page) return;
      page.render(function (err, content) {
        // update the content on the page
        page.content = content;
        page.ext = '.md';
      });
    });
    // done so call `next` with an empty object
    next(null, {});
  }
]);


// add a new helper that adds `apidoc` contents to the cache
template.asyncHelper('apidoc', function (name, options, next) {
  var fn = null;
  var ctx = this && this.context;
  if (typeof options === 'function') {
    // for lodash templates
    fn = options;
  } else if (typeof options === 'object') {
    // for handlebars templates
    fn = options.fn;
  }

  // call the function to "render" the content
  var content = fn(ctx);

  // add content as a partial
  template.partial(name, content);

  // don't return anything
  next(null, '');
});



template.apidocs('./api-docs.hbs', function () {
  // now that this is loaded, we can use the partials in the markdown file
  var keys = Object.keys(template.cache.pages);
  keys.forEach(function (key) {
    var page = template.cache.pages[key];
    page.render(function (err, content) {
      fs.writeFileSync('README.md', content);
    });
  });
});