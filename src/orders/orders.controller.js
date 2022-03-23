const { Module } = require("module");
const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function list(req, res) {
  res.json({ data: orders });
}

function hasDeliverTo(req, res, next) {
  const { data: { deliverTo } = {} } = req.body;
  if (deliverTo) {
    return next();
  }
  next({ status: 400, message: "Order must include a deliverTo" });
}

function hasMobileNumber(req, res, next) {
  const { data: { mobileNumber } = {} } = req.body;
  if (mobileNumber) {
    return next();
  }
  next({ status: 400, message: "Order must include a mobileNumber" });
}

function hasMobileNumber(req, res, next) {
    const { data: { mobileNumber } = {} } = req.body;
    if (mobileNumber) {
      return next();
    }
    next({ status: 400, message: "Order must include a mobileNumber" });
  }

  function hasDish(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    if (!dishes) {
     next({ status: 400, message: "Order must include a dish" });
    } else if (dishes.length < 1 ){

        next({ status: 400, message: "Order must include at least one dish" });
    } else if (!Array.isArray(dishes)){
        next({ status: 400, message: "Order must include at least one dish" });
    }
    return next()
  }

  function hasQuantity(req, res, next) {
    const { data: { dishes } = {} }  = req.body;
    //const { orderId } = req.params
  //  const index = orders.findIndex((order) => order.id === orderId)
   dishes.forEach((dish) => {
     const quantity = dish.quantity
   if(!quantity || quantity <= 0 || isNaN(quantity) || !Number.isInteger(quantity)){
    next({status:400, message: `Dish ${dish.id} must have a quantity that is an integer greater than 0`})
    
    }
  })
   return next()
  }


function create(req, res){
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body
    const { dishes: {quantity} = {} } = req.body
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        dishes,
    }
    orders.push(newOrder)
    res.status(201).json({ data: newOrder })
}
function orderExists(req, res, next) { 
    const { orderId } = req.params
    const { data: { id } = {} } = req.body
    const foundOrder = orders.find((order) => order.id === orderId )
    if(foundOrder){
        res.locals.order = foundOrder
        return next()
    }
    next({status: 404, message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`})
}

function readId(req, res) {
    res.json({ data: res.locals.order })
}

function hasStatus(req, res, next){
  const { data: { status } = {} } = req.body;
  if(!status){
     next({ status:400, message: "Order must have a status of pending, preparing, out-for-delivery, delivered"})
  }
  return next()
}

function statusValid(req, res, next){
  const { data: { status } = {} } = req.body;
    if(status.includes("delivered") || status.includes("pending") || status.includes("out-for-delivery")){
    return next()
  }
   next({ status:400, message: "Order must have a status of pending, preparing, out-for-delivery, delivered"}) 
}

function dataIdMatchOrderId(req, res, next){
  const { data: { id } = {} } = req.body
  const { orderId } = req.params
  if(id !== undefined && id !== null && id !== "" && id !== orderId){
    next({
      status: 400,
      message: `id ${id} must match orderId provided in parameters`,
    })
  }
  return next()
}

// function statusPending(req, res, next){
//   const { data: { status } = {} } = req.body;
//   if(status !== "pending"){
//     next({ status:400, message: "An order cannot be deleted unless it is pending"})
//   }
//   return next()
// }

function update(req, res){
  const { orderId } = req.params
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body
  const foundOrder = orders.find((order) => order.id === orderId )
  foundOrder.deliverTo = deliverTo,
  foundOrder.mobileNumber = mobileNumber
  foundOrder.dishes = dishes

  res.json({ data: foundOrder})
}

function destroy(req, res, next){
  const { orderId } = req.params
  const foundOrder = orders.find((order) => order.id === orderId )
  if(foundOrder.status === "pending"){
  const index = orders.findIndex((order) => order.id === orderId)
  orders.splice(index,1)
   res.sendStatus(204)
  }
  next({ status:400, message: "An order cannot be deleted unless it is pending"})
}

module.exports = {
  list,
  create:[hasDeliverTo, hasMobileNumber, hasDish, hasQuantity, create],
  read:[orderExists, readId],
  update:[orderExists, dataIdMatchOrderId, hasDeliverTo, hasMobileNumber, hasDish, hasQuantity,  hasStatus, statusValid, update],
  delete: [orderExists, destroy]
};
