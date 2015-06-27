# Debugging

> Learn how to track down errors in Template

Template uses [debug](https://github.com/visionmedia/debug) with custom namespaces to allow fine-grained debugging.

## Running debug

Run the following in the command line to debug:

```bash
$ DEBUG=template:* foo
```

Where `foo` is whatever command/application you're running, and `*` is the namespace to run. You can keep `*` if you wish to run all namespacess.


All available [namespaces can be found here](https://github.com/jonschlinkert/template/blob/master/lib/debug.js#L38-L50).

## Windows

You might need to use a different approach in Windows. If the command above doesn't work, as a quickfix try adding the following above the `require` statements in your application (wherever `template` is being required):

```js
process.env.DEBUG = 'template:*'
```

_(I don't have access to a Windows box atm, so if anyone has a better solution for Windows please let me know!)_
