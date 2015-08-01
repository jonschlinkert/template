
> a bunch of stuff above the docs

 - <%= apidoc('foo') %>
 - <%= apidoc('bar') %>
 - <%= apidoc('baz') %>
 - <%= apidoc('bang') %>


{{#definedoc 'foo'}}
---
msg: foo message
---
Here's some content for <%= msg %>.
{{/definedoc}}

{{#definedoc 'bar'}}
---
msg: bar message
---
Here's some content for <%= msg %>.
{{/definedoc}}

{{#definedoc 'baz'}}
---
msg: baz message
---
Here's some content for <%= msg %>.
{{/definedoc}}

{{#definedoc 'bang'}}
---
msg: bang message
---
Here's some content for <%= msg %>.
{{/definedoc}}
