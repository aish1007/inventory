/**
 * OrderController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */


module.exports = {

    //creating a new order
    createOrder: async function(req,res){
      var result;  
      var d = new Date();
      var utc = (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
      var reqObj = {
          customerEmail : req.body.email,
          date : utc,
          orderedInventory : req.body.inventoryList //[{name : "something", qty :" something"}]
          }
          //checking the product quantity in the inventory and getting the order status
            var data = await Promise.all(reqObj.orderedInventory.map(async(element) => {
            var obj = await Inventory.find({name : element.name});
            if(obj != ''){
                if(obj[0].qty > element.qty){
                    var newobj = {orderStatus : "confirmed"};
                    element = {...element, ...newobj};
                    obj[0].qty = obj[0].qty - element.qty;
                    //updating inventory with ordered quantity
                    await Inventory.update({name : obj[0].name}).set({ qty : obj[0].qty}).fetch();
                }
                else{
                    var newobj = {orderStatus : "denied"};
                    element = {...element, ...newobj};
                } 
                result = element;
            }
            else{
            result = element;
            }
            return result;
        }));
        //ordering valid items
        reqObj.orderedInventory = JSON.stringify(data.filter(elt => elt.orderStatus == "confirmed"));
        if(reqObj.orderedInventory){
            result = await Order.create(reqObj).fetch();
        }

        //sending response back to the user based on order status
        var responseArr = data.map((elt) => { 
            if(!("orderStatus" in elt)){
                return "The product "+ elt.name +" does not exist";
            }
            else if(elt.orderStatus == "denied")
            {
                return "The order for product "+elt.name+" has been denied";
            }
            else if(elt.orderStatus == "confirmed" && result != []){
                return "The order for product "+elt.name+" has been placed";
            }
            
        }); 
        res.send(responseArr);
      },

      //getting a single order record
      getOrder : async function(req,res){
        var result = [];
        var orderRecord = [];
        var reqObj = req.query;
        var obj = await Order.find(reqObj);
        console.log("fetched obj",obj);
        if(obj == ''){
            result = "Id doesn't exist";
        }
        else{
            result = obj;
        }
        res.send(result);  
      },

      //update orders
      updateOrder: async function(req,res){
       var result=[];
       var orderDbUpdate = [];
       console.log(req.body);
       //new order update
        var reqObj = {
            id : req.body.id,
            newOrder: req.body.orderedItems //[{name : 'lenovo',qty : 3}]
        }
        
        //finding old order record
        var orderRecord = await Order.find({id : reqObj.id});
        var oldOrder = JSON.parse(orderRecord[0].orderedInventory);

        //comparing old and new orders and updating their quantity 
         await Promise.all(reqObj.newOrder.map(async(newOrderElt) =>{ 
             await Promise.all(oldOrder.map(async(oldOrderElt) => {
            if(newOrderElt.name === oldOrderElt.name){
            
                //retrieving the matched product from the inventory
                var inventoryObj = await Inventory.find({name: newOrderElt.name});
                  console.log(inventoryObj);  

                if(newOrderElt.qty > oldOrderElt.qty){
                    var updatedQty = newOrderElt.qty - oldOrderElt.qty;
                    
                    if(updatedQty <= inventoryObj[0].qty){
                        var inventoryDbupdate = (inventoryObj[0].qty) - updatedQty;
                        oldOrderElt.qty = newOrderElt.qty;
                        oldOrderElt.orderStatus = "updated";
                        await Inventory.update({name : oldOrderElt.name}).set({qty : inventoryDbupdate });
                        result.push("The order for"+ oldOrderElt.name + " has been successfully updated to quantity: "+ oldOrderElt.qty);
                    } 
                    else
                    {
                        result.push("The order for "+ newOrderElt.name +" cannot be updated as the quantity exceeds the inventory capacity\n");
                    }
                }
                else if(newOrderElt.qty < oldOrderElt.qty){
                    var updatedQty = oldOrderElt.qty - newOrderElt.qty;
                    inventoryDbupdate= (inventoryObj[0].qty) + updatedQty;
                    oldOrderElt.qty = newOrderElt.qty;
                    oldOrderElt.orderStatus = "updated";
                    await Inventory.update({name : oldOrderElt.name}).set({qty : inventoryDbupdate });
                    result.push("The order for "+ oldOrderElt.name + " has been successfully updated to quantity: "+ oldOrderElt.qty);
                    
                }
                else{
                    result.push("There is no updation as the quantity for the product "+ newOrderElt.name+" is same for both the orders\n");
                }
            }
        }))}));

        //updating order db
        await Order.update({id : reqObj.id}).set({orderedInventory : JSON.stringify(oldOrder)});
          
        //   comparing old and new order records
        //   returning unmatched orders
          var unmatchedItems =  reqObj.newOrder.filter(newelt => !oldOrder.some(oldelt => newelt.name == oldelt.name));
          unmatchedItems.map(elt => result.push("The product "+elt.name+" does not exist in the order record"));
          res.send(result);    
        
      },

      deleteOrder : async function(req,res){
        var reqId = req.query.id;
        var obj = await Order.find({ id:reqId });
        if(obj == ''){
            result = "Id doesn't exist in order records";
        }
        else{
            console.log(obj);
            var orderedInventories = JSON.parse(obj[0].orderedInventory);
            Promise.all(orderedInventories.map(async(elt) => { 
                var inventoryQty = await Inventory.find({name : elt.name});
                var updatedInventoryQty = inventoryQty[0].qty+ elt.qty;
                await Inventory.update({name:elt.name}).set({ qty: updatedInventoryQty});
                console.log("done");
            }));
            var deletedOrder = await Order.destroyOne({id: reqId});
            console.log(deletedOrder);
            if(deletedOrder != ''){
                result = "Order record "+ reqId+" successfully deleted";
            }
            
        }
        res.send(result);
      }

};

