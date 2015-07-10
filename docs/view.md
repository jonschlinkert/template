# View

> A `view` is a single collection item.


## Overview

- A `view` is  object is a JavaScript object created by the `View` class.
- The `View` class is a generic factory used to create `view` objects for a [views-collection](./views-collection.md).
- Each `view` is an object
- Each view represents a cached template 
- Tyically, a `view` would be something like a page, post, partial (e.g. "partial-view"), or a layout. Accordingly, a "page" view would belong to the `pages` collection, a `layout` view would belong to the `layouts` collection, and so on.


## Properties

The following properties are automatically added to every `view` object:

- `data` **{Object}**: typically created from YAML front matter.
- `locals` **{Object}**: 
- `options`: options for things like routes, and other properties that don't really belong on locals or data.
- `path` **{String}**: File path. Since this property is used to generate `view` keys and is used in lookups throughout the application, it's a required property - even if the `view` is not an actual file. If you're creating "virtual views", just think of this property as an `id`.
- `content`



## Methods