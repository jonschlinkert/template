# Templates

> General information and conventions for working with templates

## Table of contents

<!--  -->


## template object


## file object



## Defining templates

**Valid formats**

```js
// key-value
template.page('home.tmpl', 'a <%= b %> c', {b: 'xyx'});
template.page('home.tmpl', {content: 'a <%= b %> c'}, {b: 'xyz'});
template.page('home.tmpl', {content: 'a <%= b %> c', locals: {b: 'xyz'}});
// glob pattern(s)
template.page('*.tmpl');
template.page(['*.tmpl', '*.md']);
// with optional locals
template.page(['*.tmpl', '*.md'], {foo: 'bar'});
```
