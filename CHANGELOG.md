## Changes

## Front matter

```js
app.enable('frontMatter');
```

### Templates

- `getType` > `getViewType`
- `app._.helpers` > `app._.helpers.sync`
- `app._.asyncHelpers` > `app._.helpers.async`

## viewType

Value may be an array or string:

- `isPartial` > `{ viewType: 'partial' }`
- `isRenderable` > `{ viewType: 'renderable' }`
- `isLayout` > `{ viewType: 'layout' }`

Multiple view-types may also be defined:

- `{ viewType: ['partial', 'renderable'] }`