'use strict';

var merge = require('mixin-deep');

module.exports = function mergeContext(template, locals) {
  // merge order
  var order = ['env:options', 'default:options', 'options', 'data'];
  if (this.option('preferLocals')) {
    order = order.concat(['template:options', 'template:data', 'template:locals']);
  } else {
    order = order.concat(['template:locals', 'template:data', 'template:options']);
  }

  // Calculate context
  var context = template.context.calculate(order);
  // Partial templates to pass to engines
  merge(context, this.mergePartials(locals));
  // Merge in `locals/data` from templates
  merge(context, this.cache._context.partials);
  return context;
};
