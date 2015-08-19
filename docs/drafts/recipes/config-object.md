

```js
  cache:
   { data: {},
     mixins: {},
     locals: {},
     imports: {},
     layouts: {},
     partials: {},
     anonymous: {},
     pages: {} },
  options:
   { cache: true,
     strictErrors: true,
     pretty: false,
     cwd: 'E:\\Dropbox\\Development\\generate\\utils\\template',
     ext: '*',
     destExt: '.html',
     defaultExts: [ 'md', 'html', 'hbs' ],
     layoutDelims: [ '{%', '%}' ],
     delims: [ '<%', '%>' ],
     layoutTag: 'body',
     layoutExt: null,
     layout: null,
     viewEngine: '*',
     'default engines': true,
     preprocess: true,
     preferLocals: false,
     mergePartials: true,
     mergeFunction: [Function],
     partialsKey: [Function],
     renameKey: [Function] },
  engines:
   { '.*':
      { cache: {},
        renderSync: [Function],
        render: [Function],
        renderFile: [Function: noopFile],
        __express: [Function: noopFile],
        options: {},
        helpers: {},
        name: 'noopRender' },
     '.md':
      { render: [Function],
        renderSync: [Function],
        options: [Object],
        helpers: {},
        name: 'render' },
     '.html':
      { render: [Function],
        renderSync: [Function],
        options: [Object],
        helpers: {},
        name: 'render' },
     '.hbs':
      { render: [Function],
        renderSync: [Function],
        options: [Object],
        helpers: {},
        name: 'render' } },
  delims:
   { '.*':
      { interpolate: /\<\%=([\s\S]+?)\%\>/g,
        evaluate: /\<\%([\s\S]+?)\%\>/g,
        escape: /\<\%-([\s\S]+?)\%\>/g } },
  _:
   { delims: { options: {}, delims: [Object], defaults: [Object] },
     engines: { cache: [Object] },
     helpers: { page: [Function], layout: [Function], partial: [Function] },
     asyncHelpers: { page: [Function], layout: [Function], partial: [Function] } },
  subtype: { page: 'pages', layout: 'layouts', partial: 'partials' },
  type:
   { partial: [ 'partials' ],
     renderable: [ 'pages' ],
     layout: [ 'layouts' ] },
  layoutSettings:
   { '.*': { options: [Object], cache: {} },
     '.md': { options: [Object], cache: {} },
     '.html': { options: [Object], cache: {} },
     '.hbs': { options: [Object], cache: {} } },
  router:
   { [Function: router]
     params: {},
     _params: [],
     caseSensitive: false,
     mergeParams: undefined,
     strict: false,
     stack: [ [Object], [Object] ] } }
```