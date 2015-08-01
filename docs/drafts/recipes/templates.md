# Templates

> Stuff about templates


## Template objects

Template objects are key/value pairs, where `key` is a unique identifier for the template and the value has, at miminum, the following properties:

- `path`
- `content`

**Example**

```js
{ 'foo/bar.md': {path: 'foo/bar.md', content: 'This is content.'}}
```

The default loader also adds the following properties:

- `ext`
- `layout`
- `locals`
- `options`


