var Site = require('..');
var site = new Site();


/**
 * Use the `.create()` method to create new template type.
 *
 * Example:
 *
 *     template.create(name, plural, options);
 *
 *   - `name`: the name of the template type
 *   - `plural`: the plural version of the name
 *   - `options`: options to use for any templates loaded with this type.
 *
 */



/**
 * Step #1: create a template `type`
 */


site.create('include', 'includes', { isPartial: true });


/**
 * Step #2: Usage
 */

site.include('block', {content: '<bar>{% body %}</bar>'}); // useless example
site.include('alert', {content: '<baz class="alert">Heads up!</baz>', layout: 'block'});
site.include('sidebar', {content: '<nav>This is a lame sidebar!</nav>'});
// console.log(site.get('includes'));


site.page('home.md', {content: '<foo><%= include("alert") %></foo>'});
site.render('home.md', function (err, res) {
  console.log(res)
});
