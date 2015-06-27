# Options

> Getting and setting options with Template. 

Options handling is inherited from [option-cache], please visit that library to report issues, request features or do pull requests related to options handling.

### [.option](https://github.com/jonschlinkert/option-cache/blob/master/index.js#L47)

Set or get an option.

* `key` **{String}**: The option name.    
* `value` **{*}**: The value to set.    
* `returns` **{*}**: Returns a `value` when only `key` is defined.  

```js
template.option('a', true);
template.option('a');
//=> true
```

### [.enable](https://github.com/jonschlinkert/option-cache/blob/master/index.js#L79)

Enable `key`.

* `key` **{String}**    
* `returns` **{Object}** `Template`: to enable chaining  

**Example**

```js
template.enable('a');
```

### [.disable](https://github.com/jonschlinkert/option-cache/blob/master/index.js#L97)

Disable `key`.

* `key` **{String}**: The option to disable.    
* `returns` **{Object}** `Template`: to enable chaining  

**Example**

```js
template.disable('a');
```

### [.enabled](https://github.com/jonschlinkert/option-cache/blob/master/index.js#L118)

Check if `key` is enabled (truthy).

* `key` **{String}**    
* `returns`: {Boolean}  

```js
template.enabled('a');
//=> false

template.enable('a');
template.enabled('a');
//=> true
```

### [.disabled](https://github.com/jonschlinkert/option-cache/blob/master/index.js#L139)

Check if `key` is disabled (falsey).

* `key` **{String}**    
* `returns` **{Boolean}**: Returns true if `key` is disabled.  

```js
template.disabled('a');
//=> true

template.enable('a');
template.disabled('a');
//=> false
```

### [.isTrue](https://github.com/jonschlinkert/option-cache/blob/master/index.js#L161)

Returns true if the value of `key` is strictly `true`.

* `key` **{String}**    
* `returns` **{Boolean}**: Uses strict equality for comparison.  

```js
template.option('a', 'b');
template.isTrue('a');
//=> false

template.option('c', true);
template.isTrue('c');
//=> true
```

### [.isFalse](https://github.com/jonschlinkert/option-cache/blob/master/index.js#L183)

Returns true if the value of `key` is strictly `false`.

* `key` **{String}**    
* `returns` **{Boolean}**: Uses strict equality for comparison.  

```js
template.option('a', null);
template.isFalse('a');
//=> false

template.option('c', false);
template.isFalse('c');
//=> true
```

### [.isBoolean](https://github.com/jonschlinkert/option-cache/blob/master/index.js#L206)

Return true if the value of key is either `true` or `false`.

* `key` **{String}**    
* `returns` **{Boolean}**: True if `true` or `false`.  

```js
template.option('a', 'b');
template.isBoolean('a');
//=> false

template.option('c', true);
template.isBoolean('c');
//=> true
```

### [.hasOption](https://github.com/jonschlinkert/option-cache/blob/master/index.js#L226)

Return true if `options.hasOwnProperty(key)`

* `key` **{String}**    
* `returns` **{Boolean}**: True if `key` is is on options.  

```js
template.hasOption('a');
//=> false
template.option('a', 'b');
template.hasOption('a');
//=> true
```

### [.flags](https://github.com/jonschlinkert/option-cache/blob/master/index.js#L258)

Generate an array of command line args from the given `keys` or all options.

* `keys` **{Array}**    
* `returns` **{Array}**: Array of args  

```js
// set some options
template.option('foo', 'bar');
template.option('abc', true);
template.option('xyz', 10);
template.option('one', false);

// create command line args for all options
template.flags();
//=> ['--foo=bar', '--abc', '--xyz=10', '--no-one']

// or specific options
template.flags(['foo', 'abc']);
//=> ['--foo=bar', '--abc']
```

,
