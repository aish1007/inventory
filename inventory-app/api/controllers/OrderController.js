/**
 * OrderController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */


module.exports = {
    createOrder: async function(req,res){
      var result;  
      var finalResp ='' ;
      var reqObj = {
          customerEmail : "aishwarya",
          date : Date.now(),
          orderedInventory : [{name : "nope", qty : 2},{name:"hp",qty : 13},{name:"mac",qty:4}]
          }
          //checking the product quantity in the inventory and getting the order status
            var data = await Promise.all(reqObj.orderedInventory.map(async(element) => {
            var obj = await Inventory.find({name : element.name});
            if(obj != ''){
                if(obj[0].qty > element.qty){
                    var newobj = {orderStatus : "confirmed"};
                    element = {...element, ...newobj};
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
        reqObj.orderedInventory = JSON.stringify(data.find(elt =>  elt.orderStatus == "confirmed"));
        result = await Order.create(reqObj).fetch();

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
      }

};

