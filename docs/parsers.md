# Parsers

> Parsers are functions that are used to modify objects or strings as templates are read from the file system or otherwise registered onto the cache.

## Using parsers

Parsers can either be used directly, for instance when the `.render()` method is called, or they can be registered and stored on the `parsers` cache, allowing them to be referenced or called at any time by other methods.

**Related**:

* [registering parsers]
* [getting parsers]
* [running parsers]


### Parser caching

Parsers are stored on the `parsers` object using a namespace, usually a file extension.

**Example**:

Doing `console.log(template.parsers)` might return something like:

```js
{ '.md':
   [ { parse: [Function: matterParse],
       parseSync: [Function: matterParseSync] } ],
  '.html':
   [ { parse: [Function: matterParse],
       parseSync: [Function: matterParseSync] } ],
  '.hbs':
   [ { parse: [Function: matterParse],
       parseSync: [Function: matterParseSync] } ],
  '.*': [ { parse: [Function: noop], parseSync: [Function: noopSync] } ],
```

### Parser objects

Parsers themselves are stored as objects with `parse` and/or `pareSync` methods as properties.

For example, let's say we want to parse front matter from templates as they are loaded. We might start by creating a method that looks something like this:

```js
var frontMatter = require('gray-matter');

function matter(file) {
  // note that parsers do not need to `return` anything,
  // as long as the `file` object is passed through
  merge(file, matter(file.content));
}
```

{ parse: [Function: matterParse],
       parseSync: [Function: matterParseSync] }

 and the parser we've chosen has both sync and async methods available to be used, depending on the use case.

In the previous example, you'll notice that each [parser namespace](#parser-namespaces) has an array of parser objects. This allows [parser stacks](#parser-stacks) (arrays of parser functions) to be dynamically created using the parsers stored on each object in the array.


### Parser namespaces

To ensure that parsers can be easily and correctly be associated with templates at runtime, when parsers are cached using any of the _built-in methods_ (e.g. `.parser()` and `.parserSync()`), a dot `.` is prefixed onto the parser's namespace. So a parser registered as `foo` will be cached to the `.foo` object, ensuring that lookups will be consistent throughout the rest of the application.

**Extending the `parsers` object**

If you extend the `parsers` object directly, it's highly recommended that you follow the same namespacing convention as built-in methods and prefix parser namespaces with `.`.

**Example**:

Do this:

```js
// note the dot
template.parsers['.foo'] = // foo
```

Don't do this:

```js
template.parsers['foo'] = // foo
```


## Registering parsers

Pass a string as the first argument to `.parser()` or `.parserSync()` to store parser functions to that _namespace_ on the cache. Typically `ext` is used.

**Example**:

```js
template
  .parser('txt', function() {})
  .parser('txt', function() {})
  .parser('txt', function() {})
```

Both methods are chainable, so the following is also possible:

```js
template
  .parser('txt', function() {})
  .parser('txt', function() {})
  .parser('txt', function() {})

template
  .parserSync('txt', function() {})
  .parserSync('txt', function() {})
  .parserSync('txt', function() {})
```


* `.parser()`
* `.parserSync()`


## Getting parsers

Parsers are stored on the `parser` object. To get parsers directly, simply do:

```js
var parsers = template.parsers;
```

**Note that** when looking up parsers directly you'll need to prefix the lookup string with `.`. So even if you registered `.parser('txt', fn)`, you'll need to use `template.parsers['.txt']` to retrieve the parser. [Read why](#parser-caching).

```js
var markdownParser = template.parsers['.md'];
```

Get parsers from the cache by either calling the

* `.getParser()`


## Running parsers

* `.parse()`
* `.parseSync()`

