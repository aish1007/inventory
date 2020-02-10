# Inventory-Order Service

## Author
- [Aishwarya Narayanan](https://github.com/aish1007)


### Table of Contents

1. [Introduction](###])
2. [Tech Stack](###)
3. [Installation Instructions](###)
4. [Running the app](###)
5. [Running the testcases](###)
6. [Data Models](###)
7. [Assumptions](###)
8. [End points](###)
9. [Todos](###)


### Introduction
The web service enables customers to order products via REST API from an inventory. As the orders are placed, updated and cancelled, the inventory is modified accordingly.
### Tech Stack

* Sails.js - Model-View-Controller web application framework to develop REST API.
* Node.js - Javascript run time environment required for running Sails.js.
* MySQL - Database used for  maintaining inventory and order records 
* Nodemon - Tool used for automatic restart of the app when any changes are made in a file.
* Mocha and Chai - Javascript frameworks used for unit testing

### Installation Instructions
- Clone the repository from the url [https://github.com/aish1007/inventory.git]
- Open the terminal and run the following commands
        - Navigate to the destination folder with "cd inventory/inventory-app"
        - Install all the dependencies with "npm install"
### Running the app
- Run the app with the command "nodemon" in the destination folder
- The app will be up and running in http://localhost:1337/
### Running the test cases
- Terminate the app before running test cases, as both the app and test cases are configured to run in the same port
- Run all the test cases with the command "npm test" 

### Data Models 
| Inventory | Type | Definition |
| ------ | ----- | ------------ |
| name | string | Name of the product in the inventory
| desc | string | Description of the product
| price | number | Price of the product
| qty | number | Quantity of the product in the inventory

| Order | Type | Definition |
| ------ | ------| -------- |
| CustomerEmail | string | Email address of the customer who placed the order
| Date | string | Date when the order was placed
| orderedInventory | list | List of items ordered by the customer
### Assumptions
- Name of every product in the inventory is unique
- Customer email id is unique for all orders 
### End points 
- Read all inventory items 
    - Route - GET /inventories
    - Response - Returns a list of items in the inventory [Array of objects]
- Read a single item in the inventory
    - Route - GET /inventories
    - Parameters - Either name or id of the product ( Parameters are passed in the query param)
    - Response - Returns the fetched object from the inventory [ A single object in a array ]
    - Throws error message when the product does not exist
    - Example request - GET http://localhost:1337/inventories&id=1
- Create a new inventory
    - Route - POST /addInventories
    - Parameters - name,desc,price,qty (passed in the query param)
    - Response - Returns the created object [A single object in a array]
    - Throws error message when trying to insert duplicate records
    - Example request - POST http://localhost:1337/addinventories?name=redmi&desc=Mobile&price=400&qty=72
- Update Inventory item
    - Route - PUT /updateInventory
    - Parameters - id,qty (passed in the query param)
    - Response - Returns the updated object [A single object in a array]
    - Throws error message when the product does not exist
    - Example request - PUT http://localhost:1337/updateInventory?id=1&qty=90
- Delete Inventory item
    - Route - DELETE /deleteInventory
    - Parameters - id/name (passed in the query param)
    - Response - Returns a success message [String]
    - Throws error message when the product does not exist
    - Example request - DELETE http://localhost:1337/deleteInventory?name=redmi
- Read all orders 
    - Route - GET /orders
    - Response - Returns the list of orders [Array of objects]
- Read a single order
    - Route - GET /orders
    - Parameters - id/customerEmail (passed in the query param)
    - Response - Returns the created object [A single object in a array]
    - Throws error message when the product does not exist
    - Example request - GET http://localhost:1337/orders?customerEmail=aishwarya@gmail.com
- Create a new order
     - Route - POST /createOrder
    - Parameters - customerEmail,desc,price,qty (passed in the query param)
    - Response - Returns a array of messages about the order placement [Array of string]
    - The order will not be placed if the order quantity for the product exceeds the inventory quantity
    - The order will not be placed if the product does not exist in the inventory
    - Example request
      - URL - POST http://localhost:1337/createOrder
      - Body - {
                "email" : "david@gmail.com",
                "inventoryList" : [{"name" : "lenovo", "qty" : 3}]
                }
- Delete a order 
   - Route - DELETE /deleteOrder
    - Parameters - id or name (passed in the query param)
    - Response - Returns a success message [String]
    - Throws error message when order does not exist 
    - Example request
      - URL - DELETE http://localhost:1337/deleteOrder&customerEmail=david@gmail.com
- Update a order 
    - Route - PUT /updateOrder
    - Parameters - id and orderedItems
    - Response - Returns a array of messages about the updation status of the order
    - A order will not be updated if the quantity to be updated exceeds the inventory quantity
    - A order will not be updated if there is no change in the product quantity 
    - A order will not be updated if there is no order record
    - Example request
      - URL - PUT http://localhost:1337/updateOrder
      - Body - {
            	"id":25,
            	"orderedItems":[{"name" : "asus","qty" : 4}]
               }

### Todos
- Write more test cases
- Add a front end to the app


