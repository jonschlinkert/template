# template [![NPM version](https://badge.fury.io/js/template.png)](http://badge.fury.io/js/template)

> Utility library for processing Lo-Dash templates.


```bash
npm i template --save
```

## Usage

```js
var template = require('template');
var opts = {
  data: {
    one: "baz",
    two: function(val) {
      return val || 'nada!';
    }
  },
  delims: ['{%', '%}']
};
template.process('foo.txt', opts);
```

## String patterns

Will evaluate and process the following patterns:

```js
// Variables
foo
foo.bar
foo.bar.baz

// Functions, as properties on the data object
one()
two.three()

// Lo-Dash Mixins
_.foo()
_.foo(bar)
_.foo("baz")
```

## Authors

**Jon Schlinkert**

+ [github/jonschlinkert](https://github.com/jonschlinkert)
+ [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

**Brian Woodward**

+ [github/doowb](https://github.com/doowb)
+ [twitter/doowb](http://twitter.com/jonschlinkert)

## License
Copyright (c) 2014 [Jon Schlinkert](http://twitter.com/jonschlinkert), [Brian Woodward](http://twitter.com/doowb), contributors.
Released under the [MIT license](./LICENSE-MIT)