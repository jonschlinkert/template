// var Route = require('../route');
// var should = require('should');


// // Route tests from kerouac
// describe('Route', function () {
//   describe('with path', function () {
//     var route = new Route('/welcome', [
//       function () {}
//     ]);

//     it('should have path property', function () {
//       route.path.should.equal('/welcome');
//     });

//     it('should have fns property', function () {
//       route.fns.should.be.instanceof(Array);
//       route.fns.should.have.length(1);
//     });

//     it('should have whole path', function () {
//       route.isWholePath().should.be.true;
//     });

//     it('should match correctly', function () {
//       route.match('/welcome').should.be.true;
//       route.match('/not-welcome').should.be.false;
//     });
//   });


//   describe('with parameterized path', function () {
//     var route = new Route('/blog/:year/:month/:day/:slug', [
//       function () {}
//     ]);

//     it('should have path property', function () {
//       route.path.should.equal('/blog/:year/:month/:day/:slug');
//     });

//     it('should have fns property', function () {
//       route.fns.should.be.instanceof(Array);
//       route.fns.should.have.length(1);
//     });

//     it('should not have whole path', function () {
//       route.isWholePath().should.be.false;
//     });

//     it('should match correctly', function () {
//       route.match('/blog/2013/04/18/hello-world').should.be.true;
//       route.params.should.be.instanceof(Object);
//       Object.keys(route.params).should.have.length(4);
//       route.params.year.should.equal('2013');
//       route.params.month.should.equal('04');
//       route.params.day.should.equal('18');
//       route.params.slug.should.equal('hello-world');

//       route.match('/blog/2013/04/18').should.be.false;
//       route.match('/not-blog/2013/04/18/hello-world').should.be.false;
//     });
//   });
// });