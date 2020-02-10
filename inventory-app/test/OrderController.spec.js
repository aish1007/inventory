var supertest = require('supertest');
var expect = require('chai').expect;


describe('Order Controller', function () {
 
var getInventoryQty = function(data) {
  var agent = supertest.agent(sails.hooks.http.app);
  return agent.get('/inventories?name='+data).then(resp=>{return resp.body[0].qty});
}
 

  it('GET /orders should return list of orders', function (done) {
    var agent = supertest.agent(sails.hooks.http.app);
    agent
      .get('/orders')
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


it('GET /orders should fetch a order based on the id', function (done) {
    var agent = supertest.agent(sails.hooks.http.app);
    agent
      .get('/orders?id=2')
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


  it('GET /orders should return error message if the ID does not exist', function (done) {
    var agent = supertest.agent(sails.hooks.http.app);
    agent
      .get('/orders?id=100')
      .set('Accept', 'application/json')
      .expect('Content-Type', "text/html; charset=utf-8")
      .expect(200)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
         var result = res.text;
         expect(result).to.equal("Order record does not exist");
         done();
        }
      });
  });


  it('DELETE /deleteOrders should delete a order and the inventory should be updated',async function(){
    var agent = supertest.agent(sails.hooks.http.app);

    var order = {
        "email" : "aishwarya@gmail.com",
        "inventoryList" : [{"name" : "mac", "qty" : 2}]
        };
    //getting current inventory quantity
    var oldInventoryQty = await getInventoryQty("mac");

   //deleting the order for "aishwaryah@gmail.com"
    return agent
            .delete('/deleteOrder?customerEmail=aishwarya@gmail.com')
            .set('Accept', 'application/json')
            .expect('Content-Type', "text/html; charset=utf-8")
            .expect(200)
            .then(async(res) => {
            expect(res.text).to.equal('The order has been successfully deleted');
            
            //expecting old inventory quantity to be greater than new inventory quantity
            var newInventoryQty = await getInventoryQty("mac");
            expect(newInventoryQty).to.be.gt(oldInventoryQty);
            
            //re-inserting the record to the orders for recursive testing  
            await agent.post('/createOrder').send(order).then(resp => {
                
              }); 
    });
  });


  it('DELETE /deleteOrders should throw errors for invalid id',function(){
    var agent = supertest.agent(sails.hooks.http.app);
    return agent
          .delete('/deleteOrder?id=78')
          .set('Accept', 'application/json')
          .expect('Content-Type', "text/html; charset=utf-8")
          .expect(200)
          .then(res => {
            expect(res.text).to.equal('Product does not exist in order records');
  });
  });


  it('POST /createOrders should create a new order and inventory should be updated',async function(){
    var agent = supertest.agent(sails.hooks.http.app);
    var order = {
      "email" : "john@gmail.com",
      "inventoryList" : [{"name" : "asus", "qty" : 2},{"name" : "dell", "qty":2}]
      };

    //getting current inventory quantity
    var oldQtyAsus = await getInventoryQty("asus");
    var oldQtyDell = await getInventoryQty("dell");
    return agent
           .post('/createOrder')
           .send(order)
           .set('Accept', 'application/json')
           .expect('Content-Type', /json/) 
           .expect(200)
           .then(async(res) => {
              var result = res.body;
              result.should.be.an('array');

             //getting inventory quantity again
              var newQtyAsus = await getInventoryQty("asus");
              var newQtyDell = await getInventoryQty("dell");

              //expecting new inventory to be less than old inventory
              expect(newQtyAsus).to.be.lt(oldQtyAsus);
              expect(newQtyDell).to.be.lt(oldQtyDell);

              //deleting the record from the orders for recursive testing  
              await agent.delete('/deleteOrder?customerEmail=john@gmail.com').then(resp => {
                return resp }); 

           });
     });


  it('POST /createOrder should reject orders if it exceeds inventory quantity',async function(){
    var agent = supertest.agent(sails.hooks.http.app);
    var order = {
      "email" : "john@gmail.com",
      "inventoryList" : [{"name":"asus","qty":2},{"name" : "dell", "qty":200}]
      };
    var oldQtyAsus = await getInventoryQty("asus");  
    return agent
           .post('/createOrder')
           .send(order)
           .set('Accept', 'application/json')
           .expect('Content-Type', /json/) 
           .expect(200)
           .then(async(res) => {
            expect(res.body).to.include('The order for product dell has been denied as it exceeds inventory quantity');
            expect(res.body).to.include('The order for product asus has been placed');

           //getting inventory quantity again
           var newQtyAsus = await getInventoryQty("asus");

           //expecting new inventory qty to be less than old inventory qty 
           expect(newQtyAsus).to.be.lt(oldQtyAsus);

           //deleting the record from the orders for recursive testing  
          await agent.delete('/deleteOrder?customerEmail=john@gmail.com').then(resp => {
              return resp }); 

           });
  });

  it('POST /createOrder should reject product if it does not exist in the inventory',function(){
    var agent = supertest.agent(sails.hooks.http.app);
    var order = {
      "email" : "john@gmail.com",
      "inventoryList" : [{"name":"LG","qty":2}]
      };
    return agent
            .post('/createOrder')
            .send(order)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/) 
            .expect(200)
            .then(res => { 
              expect(res.body).to.include("The product LG does not exist in the inventory");
             });
  });

  it('PUT /updateOrder should update the order and the inventory',async function(){
    var agent = supertest.agent(sails.hooks.http.app);
    var oldOrder = {
        "id" : 25,
        "orderedItems" : [{"name":"asus","qty":3}]
    }

    var newOrder = {
      "id" : 25,
      "orderedItems" : [{"name":"asus","qty":4}]
      };
    
      var oldQtyAsus = await getInventoryQty("asus"); 

      return agent 
              .put('/updateOrder')
              .send(newOrder)
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/) 
              .expect(200)
              .then(async(res) => {
                expect(res.body).to.include("The order for asus has been successfully updated to quantity: 4");    
                
                //getting inventory qty again
                var newQtyAsus = await getInventoryQty("asus"); 
                //expecting new inventory qty to be less than old inventory qty 
                expect(newQtyAsus).to.be.lt(oldQtyAsus);
                
                //updating the record again for recursive testing
                await agent.put('/updateOrder').send(oldOrder).then(resp => {return resp});
              });
  });

  it('PUT /updateOrder should reject the order update if it exceeds inventory quantity',function(){
    var agent = supertest.agent(sails.hooks.http.app);
    var order = {
        "id" : 25,
        "orderedItems" : [{"name":"asus","qty":500}]
    }
    return agent
            .put('/updateOrder')
            .send(order)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/) 
            .expect(200)
            .then(async(res) => {
                expect(res.body).to.include("The order for asus cannot be updated as the quantity exceeds the inventory capacity"); 
            });
  });

  it('PUT /updateOrder should throw error if there is no order update',function(){
    var agent = supertest.agent(sails.hooks.http.app);
    var order = {
        "id" : 25,
        "orderedItems" : [{"name":"asus","qty":3}]
    }
    return agent
            .put('/updateOrder')
            .send(order)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/) 
            .expect(200)
            .then(async(res) => {
                expect(res.body).to.include("There is no updation as the quantity for the product asus is same for both the orders"); 
            });
  });


});