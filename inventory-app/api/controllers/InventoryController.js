/**
 * InventoryController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var request = require('request');
module.exports = {

getInventory: async function(req,res){
    var result;
    var reqObj = req.query;
    var obj = await Inventory.find(reqObj);
    console.log("fetched obj",obj);
    if(obj == ''){
        result = "Id doesn't exist";
    }
    else{
        result = obj;
    }
    res.send(result);
},
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
updateInventory : async function(req,res){
    var result;
    var reqObj = req.query;
    var updateObj = _.omit(reqObj,'id'); 
    var updatedObj = await Inventory.update({ id:reqObj.id })
    .set(updateObj).fetch();
    if(updatedObj == ''){
        result = "Id doesn't exist";
    }
    else{
        result = updatedObj;
    }
    res.send(result);

},

deleteInventory: async function(req,res){
    var reqObj = req.query;
    var obj = await Inventory.find({ id:reqObj.id });
    if(obj == ''){
        result = "Id doesn't exist";
    }
    else{
        await Inventory.destroyOne({id: reqObj.id});
        result = "Inventory successfully deleted";
    }
    res.send(result);
}


};

