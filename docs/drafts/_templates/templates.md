# Templates

> General information and conventions for working with templates

## Table of contents

<!--  -->


## template object

A `template` object is a key-value, where `key` is the unique name of the template, and `value` is an object with properties such as `content` and `path`. The `value` is sometimes referred to as `file`, since this object is used to create [vinyl] files in in Template-based applications.

**Example**

```js
// file object
var file = {path: 'a/b/c.hbs', content: '<body> This is content! </body>'};

// template object
{'c.hbs': file}
```


## Register templates

**Add a single template**

```js
template.page('home', 'This is {{title}}.', {title: 'home'});
template.page('home', {content: 'This is {{title}}.', title: 'home'});
```

**Add multiple templates**

```js
template.pages('pages/*.hbs');
template.pages(['partials/*.hbs', 'includes/*.hbs']);
```

**More info**

- [loading templates](#loading-templates)


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

## Template lookups

> Methods for finding and renaming templates

### .lookup


### .find

Find a template by it's [type](./template-type.md). Returns the first template that matches the given `key`.

Searches all views of [view-subtypes][subtypes] of the given [type], returning the first template found with the given `key`. Optionally pass an array of `subtypes` to limit the search;

**Params**

* `type` **{String}**: The template type to search.
* `key` **{String}**: The template to find.
* `subtypes` **{Array}**

**Example**

```js
template.find('renderable', 'home', ['page', 'post']);
```

### .findRenderable

Search all renderable `subtypes`, returning the first template with the given `key`.

* If `key` is not found `null` is returned
* Optionally limit the search to the specified `subtypes`.

**Params**

* `key` **{String}**: The template to search for.
* `subtypes` **{Array}**

### .findLayout

Search all layout `subtypes`, returning the first template with the given `key`.

* If `key` is not found `null` is returned
* Optionally limit the search to the specified `subtypes`.

**Params**

* `key` **{String}**: The template to search for.
* `subtypes` **{Array}**

### .findPartial

Search all partial `subtypes`, returning the first template with the given `key`.

* If `key` is not found `null` is returned
* Optionally limit the search to the specified `subtypes`.

**Params**

* `key` **{String}**: The template to search for.
* `subtypes` **{Array}**

{%%= reflinks(['assemble', 'verb', 'vinyl']) %}