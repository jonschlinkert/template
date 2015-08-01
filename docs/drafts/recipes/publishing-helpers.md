# Publishing a helpers as npm modules

> If other users can benefit from your helper, please consider publishing it to npm!

To publish your helper, you can [create one from scratch](), or use one a [generator](#helper-generators) to speed things up:

## Helper generators

 - [generator-helper](https://github.com/assemble/generator-helper):
 - [generator-assemble](https://github.com/assemble/generator-assemble)




## Example helper

```js
'use strict';

/**
 * Include helper, for adding template "includes" to other templates
 *
 * @param {String} `name` the name of the template to include
 * @param {Object} `locals` Data to pass to the render method
 * @return {String}
 */

module.exports = function include(name, locals) {
  var template = name;

  if (this && this.app && this.app.includes) {
    template = this.app.includes[name];
  }

  //
};
```
