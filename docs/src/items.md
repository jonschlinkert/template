## Collection items

> Learn about working with collection items.

## Table of contents

<!-- toc -->

## Creating Items

There are a few ways to add an item to a collection.

- [instantiate](#instantiate)
- [addItem](#addItem)
- [loaders](#loaders)

special, like other collections, inherit the `Collection` that 


### Instantiate

**Create an instance of `Item`**

Create an instance of `Item` 

```js
var Item = app.get('Item');
var item = new Item();
```

### .addItem

Call the `.addItem` method on a collection:

```js
var Collection = app.get('Collection');
var item = collection.addItem('foo', {...});
```

### Loaders

By default, unless overridden in the options, `helpers` and `views` are both loaded onto their respective collections using built-in [loaders](loaders.md). 

When working with [view collections]()


## Item methods

### .write

**writing files**

- all collection items have a `write` method that, when called, writes the `item` to disk.
- if the `item` has a `content` property and it's a string, the content will be written to the specified `dest.path`
- if the `item` does not have a string content property, it will be copied from `src.path` to `dest.path`
- the item must have a `dest.path` property to be written to disk
- any `cwd` defined on the item will be prepended to the `dest.path`

**writing collections**

- all collections have a `write` method
- when the `write` method is called, all items in the collection will be written to disk
- items are written by looping over the items in the collection and calling the `write` method on each item
- if a `cwd` is defined on the collection, it will be prepended and/or resolved with the `cwd` defined on the `item`
- the resolved `cwd` path is prepended to the `dest.path` defined on the item
- if `cwd` is not defined on the collection or item, a globally defined `cwd` may be used

## Related

- [view collections](view-collections.md): special collections for storing views (templates).  

