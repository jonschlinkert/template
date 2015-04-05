


```js
this.disable('preferLocals');

// routes
this.enable('default routes');
this.option('router methods', []);

// engines
this.disable('debugEngine');
this.enable('default engines');
this.option('viewEngine', '*');

// helpers
this.enable('default helpers');

// layouts
this.enable('mergeLayouts');
this.option('layoutDelims', ['{%', '%}']);
this.option('layoutTag', 'body');
this.option('defaultLayout', null);
this.option('layoutExt', null);
this.option('layout', null);

// partials
this.enable('mergePartials');

// Custom function for naming partial keys
this.option('partialsKey', function (fp) {
  return path.basename(fp, path.extname(fp));
});

// Custom function for all other template keys
this.option('renameKey', function (fp) {
  return path.basename(fp);
});

// Custom function for getting a loader
this.option('matchLoader', function () {
  return 'default';
});
```


```js
this.disabl('debugEngine');
this.disabl('preferLocals');
this.enable('case sensitive routing');
this.enable('default engines');
this.enable('default helpers');
this.enable('default routes');
this.enable('mergePartials');
this.enable('preferLocals');
this.enable('strict errors');
this.enable('strict routing');
this.option('debugEngine');
this.option('defaultLayout', null);
this.option('getExt');
this.option('helpers');
this.option('layout', null);
this.option('layoutDelims', ['{%', '%}']);
this.option('layoutExt');
this.option('layoutExt', null);
this.option('layoutTag', 'body');
this.option('mergeContext');
this.option('mergeLayouts');
this.option('mergePartials');
this.option('normalize');
this.option('matchLoader', function () {});
this.option('partialsKey', function (fp) {});
this.option('renameKey', function (fp) {});
this.option('router methods', []);
this.option('viewEngine', '*');
```
