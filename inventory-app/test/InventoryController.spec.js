var supertest = require('supertest');
var expect = require('chai').expect;

describe('Inventory Controller', function () {


it('GET /inventories should return list of inventories', function (done) {
   var agent = supertest.agent(sails.hooks.http.app);
   agent
     .get('/inventories')
     .set('Accept', 'application/json')
     .expect('Content-Type', /json/)
     .expect(200)
     .end(function (err, res) {
       if (err) {
         done(err);
       } else {
        var result = res.body;
        result.should.be.an('array');
        done();
       }
     });
});

it('GET /inventories should fetch a inventory based on the id', function (done) {
  var agent = supertest.agent(sails.hooks.http.app);
  agent
    .get('/inventories?id=1')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      if (err) {
        done(err);
      } else {
       var result = res.body;
       result.should.be.an('array');
       done();
      }
    });
});


it('GET /inventories should return error message if the ID does not exist', function (done) {
  var agent = supertest.agent(sails.hooks.http.app);
  agent
    .get('/inventories?id=100')
    .set('Accept', 'application/json')
    .expect(200)
    .end(function (err, res) {
      if (err) {
        done(err);
      } else {
       var result = res.text;
       expect(result).to.equal("Product does not exist");
       done();
      }
    });
});

it('POST /addInventories should create a new inventory',function(){
  var agent = supertest.agent(sails.hooks.http.app);
  return agent
    .post('/addInventories?name=iphone&desc=mobile&price=1200&qty=12')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .then(res => {
      expect(res.body.name).to.equal('iphone');
      //deleting the id from the inventory for recursive testing  
      agent.delete(`/deleteInventory?id=${res.body.id}`).then(resp => {
        return resp;
      }); 
  });
});

it('POST /addInventories should reject duplicate records while being inserted',function(){
  var agent = supertest.agent(sails.hooks.http.app);
  return agent
    .post('/addInventories?name=asus')
    .set('Accept', 'application/json')
    .expect('Content-Type', "text/html; charset=utf-8")
    .expect(200)
    .then(res => {
      expect(res.text).to.equal('Duplicate records cannot be inserted');
      agent.put(`/deleteInventory?id=${res.body.id}`).then(resp => {
        return resp;
      }); 
  });
});

it('PUT /updateInventory should update the record with inventory id',function(){
  var agent = supertest.agent(sails.hooks.http.app);
  return agent
    .put('/updateInventory?id=4&qty=12')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .then(res => {
      expect(res.body[0].qty).to.equal(12);
      //updating the quantity again for recursive testing 
      agent.put('/updateInventory?id=4&qty=50').then(resp => {
        return resp;
      }); 
       
  });
});


it('PUT /updateInventory should throw error if the id does not exist',function(){
  var agent = supertest.agent(sails.hooks.http.app);
  return agent
    .put('/updateInventory?id=909&qty=12')
    .set('Accept', 'application/json')
    .expect(200)
    .then(res => {
      expect(res.text).to.equal("Id does not exist");
  });
});

it('DELETE /deleteInventory should delete a inventory', function () {
   var agent = supertest.agent(sails.hooks.http.app);
   return agent
     .delete('/deleteInventory?name=lenovo')
     .set('Accept', 'application/json')
     .expect('Content-Type', "text/html; charset=utf-8")
     .expect(200)
     .then(res => {
        expect(res.text).to.equal("Inventory successfully deleted");
        //re-inserting the record for recursive testing 
       return agent
          .post('/addInventories?name=lenovo&desc=laptop&price=1200&qty=12')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
           .then(res => {});
       
     });
});

it('DELETE /deleteInventory should throw error if the product does not exist in the inventory', function () {
  var agent = supertest.agent(sails.hooks.http.app);
  return agent
    .delete('/deleteInventory?name=test')
    .set('Accept', 'application/json')
    .expect('Content-Type', "text/html; charset=utf-8")
    .expect(200)
    .then(res => {
       expect(res.text).to.equal("Product does not exist");
    });
});

});
