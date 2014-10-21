var Engine = require('..');
var template = new Engine();


template.create('doc', { isRenderable: true });
template.create('example', { isPartial: true });

