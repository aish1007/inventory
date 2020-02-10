/**
 * InventoryController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var request = require('request');
module.exports = {

//fetch a product with a name or a id
getInventory: async function(req,res){
    var result;
    var reqObj = req.query;
    var obj = await Inventory.find(reqObj);
    if(obj == ''){
        result = "Product does not exist";
    }
    else{
        result = obj;
    }
    res.send(result);
},

//creating a new inventory
addInventory: async function(req,res){
    var result;
    var reqObj = req.query;
    var obj = await Inventory.find(reqObj);
    if(obj == ''){
        result = await Inventory.create(reqObj).fetch();
    }
    else{
        result = "Duplicate records cannot be inserted";
    }
    res.send(result);
},

//updating a inventory with id
updateInventory : async function(req,res){
    var result;
    var reqObj = req.query;
    var updateObj = _.omit(reqObj,'id');
    var updatedObj = await Inventory.update({id : reqObj.id})
    .set(updateObj).fetch();

    if(updatedObj == ''){
        result = "Id does not exist";
    }
    else{
        result = updatedObj;
    }
    res.send(result);

},

//delete a product with a name or a id
deleteInventory: async function(req,res){
    var reqObj = req.query;
    var obj = await Inventory.find(reqObj);
    if(obj == ''){
        result = "Product does not exist";
    }
    else{
        await Inventory.destroyOne(reqObj);
        result = "Inventory successfully deleted";
    }
    res.send(result);
}


};

