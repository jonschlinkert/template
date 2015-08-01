# Template types

> Learn about template types and sub-types, and how to use them

In a nutshell:

 - **types** are used by Template as a way of simplifying the logic for things like applying layouts, rendering, and injecting partials. There are only three `types` of templates: [renderable], [layout], and [partial].
 - **subtypes** sub-types are use-case specific, like `page`, `post`, and `doc`. Each of these describes a certain use cases for `renderable` templates.

This will all make more sense as you scan the examples!

## types

This section describes the three built-in template `types`, their associated `subtypes`,
and how they're used.

### renderable

The default `renderable` subtype is `page`. Here is an example of how a `page` is defined:

If you expect to render a template at some point, that qualifies is as a `renderable` template.



 - `layout`: templates to be used as layouts (wrappers for other templates)
 - `partial`: templates to be used as includes or partial views

**subtypes**

Template `subtypes` can belong to one or more `types`. It's easiest to understand by way of example.


Templates are classified by three major `types`, **renderable**, **layout**, and **partial**, each of which may contain any number of custom template `subtypes`.

## Types

Types can be viewed as "buckets" for sub-types, where each `type` is descriptive of the major _role_ that its `subtypes` and the templates they stored are expected to play.

**Types and built-in subtypes**

  1. `renderable`: Templates that are expected to be rendered at some point. The default renderable `subtype` is `page`,
  1. `layout`: Templates to be used as layouts (e.g. "wrappers") for other templates. The default layout `subtype` is `layout`, but examples of custom layout subtypes might be `block` or `section`.
  1. `partial`: Templates to be used as partial views (e.g. includes) by helpers or other templates. The default partial `subtype` is `partial`.




For example, the `renderable` type contains the subtype `page`
  - `subtype`: template `subtypes` are generally use-case specific. For example, `post`, `page`, `document` and `file`


  The purpose of this classification is to ensure that you can reliably expect templates when sub-types are created for a `type` consistently reflect the `type` in which they are categorized: "renderable", "layouts", or "partial"

## Built-in subtypes

Print out the `template` object:

```js
var template = new Template();
console.log(template);
```

and look for the following properties:

```js
{
  type:
   { partial: [ 'partials', 'posts', 'docs' ],
     renderable: [ 'pages' ],
     layout: [ 'layouts' ] },
  subtype:
   { page: 'pages',
     layout: 'layouts',
     partial: 'partials' },
}
```


## Template types

One of the most powerful features of Template is the ability to define custom template "types", and "subtypes". Here's how it works:

 - **types**: there are three template "types": `renderable`, `layout` and `partial`
 - **subtypes**: an unlimited number of subtypes can be created for each _type_. For example, `page` and `post` are common "renderable" subtypes, `block` or `section` would make good "layout" subtypes, and `include` or `snippet` make sense as "partial" subtypes.

### Template types

 - `renderable`: templates that might be rendered at some point, like `pages`
 - `layout`: used to wrap other templates with common code or content. Layouts can be used with any template type, including other layouts or partials.
 - `partial`: partial views, or includes that can be inserted into other templates.


### Template subtypes

Create any kind of template you can imagine, for any use case. Out of the box, Template supports the following:

  - `pages`: pages  default `renderable` what you might expect. This is the

