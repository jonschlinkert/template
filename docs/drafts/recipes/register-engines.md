# Registering engines

> Learn how to register template engines

**Examples**

Each of the engines in the following examples will only process content from files with extensions that match the name of the engine.

```js
// process handlebars templates in `.hbs` files
template.engine('.hbs', require('engine-handlebars'));
// process lodash templates in `.tmpl` files
template.engine('.tmpl', require('engine-lodash'));
// compile '.less' to '.css'
template.engine('.less', require('engine-less'));

// a wildcard extension matches everything
template.engine('*', require('engine-lodash'));

// multiple extensions may be associated with an engine
template.engine(['md', 'tmpl'], require('engine-lodash'));
```

**Pro-tips**

- Template has full support for [consolidate][] and [transformers][]
- Engines usually render templates, but you can also use them as pre-processors or whatever you can come up with!
- To force an engine to process certain templates that don't have file extensions, just pass the engine on the template: `template.page('foo', {content: '...'}, {engine: 'tmpl'})`
