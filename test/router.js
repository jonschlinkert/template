// var should = require('should');
// var Template = require('..');
// var template = new Template();


// // Router tests from kerouac
// describe('Router', function() {

//   describe('with two simple routes', function() {
//     var router = template.router;

//     router.route('/foo', function(page, next) {
//       page.routedToFoo = true;
//       next();
//     });

//     router.route('/bar', function(page, next) {
//       page.routedToBar = true;
//       next();
//     });

//     // it('should have two routes', function() {
//     //   router._routes.should.have.length(2);
//     // });

//     // it('should dispatch /foo', function(done) {
//     //   var page = {};
//     //   page.path = '/foo'

//     //   router.middleware(page, function(err) {
//     //     if (err) { return done(err); }
//     //     page.routedToFoo.should.be.true;
//     //     (typeof page.routedToBar == 'undefined').should.be.true;
//     //     done();
//     //   })
//     // });

//     // it('should dispatch /bar', function(done) {
//     //   var page = {};
//     //   page.path = '/bar'

//     //   router.middleware(page, function(err) {
//     //     if (err) { return done(err); }
//     //     (typeof page.routedToFoo == 'undefined').should.be.true;
//     //     page.routedToBar.should.be.true;
//     //     done();
//     //   })
//     // });

//     // it('should not dispatch /baz', function(done) {
//     //   var page = {};
//     //   page.path = '/baz'

//     //   router.middleware(page, function(err) {
//     //     if (err) { return done(err); }
//     //     (typeof page.routedToFoo == 'undefined').should.be.true;
//     //     (typeof page.routedToBar == 'undefined').should.be.true;
//     //     done();
//     //   })
//     // });

//   });

//   // describe('with route containing multiple callbacks', function() {

//   //   var router = new Router();

//   //   router.route('/foo',
//   //     function(page, next) {
//   //       page.routedTo = [ '1' ];
//   //       next();
//   //     },
//   //     function(page, next) {
//   //       page.routedTo.push('2');
//   //       next();
//   //     },
//   //     function(page, next) {
//   //       page.routedTo.push('3');
//   //       next();
//   //     });

//   //   it('should dispatch /foo', function(done) {
//   //     var page = {};
//   //     page.path = '/foo'

//   //     router.middleware(page, function(err) {
//   //       if (err) { return done(err); }
//   //       page.routedTo.should.be.an.instanceOf(Array);
//   //       page.routedTo.should.have.length(3);
//   //       page.routedTo[0].should.equal('1');
//   //       page.routedTo[1].should.equal('2');
//   //       page.routedTo[2].should.equal('3');
//   //       done();
//   //     })
//   //   });

//   // });

//   // describe('with route containing multiple callbacks some of which are skipped', function() {

//   //   var router = new Router();

//   //   router.route('/foo',
//   //     function(page, next) {
//   //       page.routedTo = [ 'a1' ];
//   //       next();
//   //     },
//   //     function(page, next) {
//   //       page.routedTo.push('a2');
//   //       next('route');
//   //     },
//   //     function(page, next) {
//   //       page.routedTo.push('a3');
//   //       next();
//   //     });

//   //   router.route('/foo', function(page, next) {
//   //     page.routedTo.push('b1');
//   //     next();
//   //   });

//   //   it('should dispatch /foo', function(done) {
//   //     var page = {};
//   //     page.path = '/foo'

//   //     router.middleware(page, function(err) {
//   //       if (err) { return done(err); }
//   //       page.routedTo.should.be.an.instanceOf(Array);
//   //       page.routedTo.should.have.length(3);
//   //       page.routedTo[0].should.equal('a1');
//   //       page.routedTo[1].should.equal('a2');
//   //       page.routedTo[2].should.equal('b1');
//   //       done();
//   //     })
//   //   });

//   // });

//   // describe('with route that is parameterized', function() {

//   //   var router = new Router();

//   //   router.route('/blog/:year/:month/:day/:slug', function(page, next) {
//   //     page.gotParams = [];
//   //     page.gotParams.push(page.params['year']);
//   //     page.gotParams.push(page.params['month']);
//   //     page.gotParams.push(page.params['day']);
//   //     page.gotParams.push(page.params['slug']);
//   //     next();
//   //   });

//   //   router.route('/blog/2013/04/20/foo', function(page, next) {
//   //     page.blogPage = true;
//   //     next();
//   //   });

//   //   it('should dispatch /blog', function(done) {
//   //     var page = {};
//   //     page.path = '/blog/2013/04/20/foo'

//   //     router.middleware(page, function(err) {
//   //       if (err) { return done(err); }
//   //       page.gotParams.should.have.length(4);
//   //       page.gotParams[0].should.equal('2013');
//   //       page.gotParams[1].should.equal('04');
//   //       page.gotParams[2].should.equal('20');
//   //       page.gotParams[3].should.equal('foo');
//   //       page.blogPage.should.be.true;
//   //       done();
//   //     })
//   //   });

//   // });

//   // describe('with route that encounters an error', function() {

//   //   var router = new Router();

//   //   router.route('/foo', function(page, next) {
//   //     next(new Error('something went wrong'));
//   //   });

//   //   it('should dispatch /foo', function(done) {
//   //     var page = {};
//   //     page.path = '/foo'

//   //     router.middleware(page, function(err) {
//   //       err.should.not.be.undefined;
//   //       err.message.should.equal('something went wrong');
//   //       done();
//   //     })
//   //   });

//   // });

//   // describe('with route that throws an exception', function() {

//   //   var router = new Router();

//   //   router.route('/foo', function(page, next) {
//   //     throw new Error('something went horribly wrong');
//   //   });

//   //   it('should dispatch /foo', function(done) {
//   //     var page = {};
//   //     page.path = '/foo'

//   //     router.middleware(page, function(err) {
//   //       err.should.not.be.undefined;
//   //       err.message.should.equal('something went horribly wrong');
//   //       done();
//   //     })
//   //   });

//   // });

//   // describe('with route containing error handling that is not called', function() {

//   //   var router = new Router();

//   //   router.route('/foo',
//   //     function(page, next) {
//   //       page.routedTo = [ '1' ];
//   //       next();
//   //     },
//   //     function(page, next) {
//   //       page.routedTo.push('2');
//   //       next();
//   //     },
//   //     function(err, page, next) {
//   //       page.routedTo.push('error');
//   //       next();
//   //     });

//   //   it('should dispatch /foo', function(done) {
//   //     var page = {};
//   //     page.path = '/foo'

//   //     router.middleware(page, function(err) {
//   //       if (err) { return done(err); }
//   //       page.routedTo.should.be.an.instanceOf(Array);
//   //       page.routedTo.should.have.length(2);
//   //       page.routedTo[0].should.equal('1');
//   //       page.routedTo[1].should.equal('2');
//   //       done();
//   //     })
//   //   });

//   // });

//   // describe('with route containing error handling that is called', function() {

//   //   var router = new Router();

//   //   router.route('/foo',
//   //     function(page, next) {
//   //       page.routedTo = [ '1' ];
//   //       next(new Error('1 error'));
//   //     },
//   //     function(page, next) {
//   //       page.routedTo.push('2');
//   //       next();
//   //     },
//   //     function(err, page, next) {
//   //       page.routedTo.push(err.message);
//   //       next();
//   //     });

//   //   it('should dispatch /foo', function(done) {
//   //     var page = {};
//   //     page.path = '/foo'

//   //     router.middleware(page, function(err) {
//   //       if (err) { return done(err); }
//   //       page.routedTo.should.be.an.instanceOf(Array);
//   //       page.routedTo.should.have.length(2);
//   //       page.routedTo[0].should.equal('1');
//   //       page.routedTo[1].should.equal('1 error');
//   //       done();
//   //     })
//   //   });

//   // });

//   // describe('with route containing error handling that is called due to an exception', function() {
//   //   var router = new Router();

//   //   router.route('/foo',
//   //     function(page, next) {
//   //       page.routedTo = [ '1' ];
//   //       wtf;
//   //       next();
//   //     },
//   //     function(page, next) {
//   //       page.routedTo.push('2');
//   //       next();
//   //     },
//   //     function(err, page, next) {
//   //       page.routedTo.push(err.message);
//   //       next();
//   //     });

//   //   it('should dispatch /foo', function(done) {
//   //     var page = {};
//   //     page.path = '/foo'

//   //     router.middleware(page, function(err) {
//   //       if (err) { return done(err); }
//   //       page.routedTo.should.be.an.instanceOf(Array);
//   //       page.routedTo.should.have.length(2);
//   //       page.routedTo[0].should.equal('1');
//   //       page.routedTo[1].should.equal('wtf is not defined');
//   //       done();
//   //     })
//   //   });

//   // });

// });
