var Site = require('..');
var site = new Site();


/**
 * Create new template type.
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

site.include('alert', {content: '<div class="alert">Heads up!</div>'});
site.include('sidebar', {content: '<div>This is a lame sidebar!</div>'});
// console.log(site.get('includes'));


site.page('home.md', {content: '<foo><%= include("alert") %></foo>'});
site.render('home.md', function (err, res) {
  console.log(res)
});
