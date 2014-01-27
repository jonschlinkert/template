# template [![NPM version](https://badge.fury.io/js/template.png)](http://badge.fury.io/js/template)

> A simple to use Lo-Dash template processing library


## Quickstart

Install with [npm](npmjs.org):

```bash
npm i template --save
```


## Usage

```js
template.process(String, {Context}, {Options});
```

```js
var template = require('template');
var foo = fs.readFileSync('foo.txt', 'utf8');

var data = {
  one: "baz",
  two: function(val) {
    return val || 'nada!';
  }
};

template.process(foo, data, {delims: ['{%', '%}']});
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

## Options



### delimiters
All of the options from the [delims](https://github.com/jonschlinkert/delims) library may be passed to the options object.


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