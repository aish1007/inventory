var sails = require('sails');
var _ = require('lodash');

global.chai = require('chai');
global.should = chai.should();

before(function (done) {
  console.log("before function");

// Increase the Mocha timeout so that Sails has enough time to lift.
this.timeout(10000);

sails.lift({
   log: {
     level: 'warn'
   },
   hooks: {
     grunt: false
   }
}, function (err, server) {
   if (err) return done(err);
   // here you can load fixtures, etc.
   done(err, sails);
});
});

after(function (done) {
 
// here you can clear fixtures, etc.
if (sails && _.isFunction(sails.lower)) {
   sails.lower(done);
}
});
