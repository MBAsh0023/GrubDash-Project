const { read } = require("fs");
const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function list(req, res) {
    res.json( { data: dishes })
}

function hasName(req,res,next){ 
    const { data: { name } = {} } = req.body;
    if(name){
        return next();
    }
    next({status:400,
    message: "Dish must include a name"});
}

function hasDescription(req, res,next){
    const { data: { description } = {} } = req.body;
    if(description){
        return next();
    }
    next({status:400,
    message: "Dish must include a description"}); 
}

function hasPrice(req, res,next){
    const { data: { price } = {} } = req.body;
    if(price){
        return next()   
    } 
    next({status:400,
        message: "Dish must include a price"});
}

function priceValid(req,res,next){
    const { data: { price } = {} } = req.body;
    if(price > 0){
        return next()  
    }
    next({status:400,
        message: "Dish must have a price that is an integer greater than 0"});
}

function priceIsValidForUpdate(req, res, next){
    const { data: { price } = {} } = req.body; 
    if(typeof(price) !== "number" || price <=0) {  
      next({status:400,
            message: "Dish must have a price that is an integer greater than 0"});
    }
  return next()
}

function hasImage(req, res,next){
    const { data: { image_url } = {} } = req.body;
    if(image_url){
        return next();
    }
    next({status:400,
    message: "Dish must include a image_url"}); 
}

function create(req, res){
    const { data: { name, description, price, image_url } = {} } = req.body
    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url
    }
    dishes.push(newDish)
    res.status(201).json({ data: newDish })
}

 function dishExists(req, res, next) {
    const { dishId } = req. params
    const { data: { id } = {} } = req.body
    const foundDish = dishes.find((dish) => dish.id === dishId)
    
    if (foundDish){
        res.locals.dish = foundDish
        return next()
    } 
    next({ status: 404,
        massage: `Dish does not exist: ${dishId}.`

    })
 }

 function idMatch(req, res, next) {
     const { data: { id } = {} } = req.body
     const { dishId } = req.params

     if ( !id || dishId == id){
        return next()
     }
        next({status:400, message:`Dish id does not match route id. Dish: ${id}, Route: ${dishId}`})
 }

 function readId(req, res){
     res.json({ data: res.locals.dish })
 }

 function update(req, res) {
    const { dishId } = req. params
    const foundDish = dishes.find((dish) => dish.id === dishId)
    const { data: { name, description, price, image_url } = {} } = req.body
    foundDish.name = name
    foundDish.description = description
    foundDish.price = price
    foundDish.image_url = image_url

    res.json({ data: foundDish })

 }



module.exports ={
    list,
    read: [dishExists, readId],
    create: [hasName, hasDescription, hasPrice, priceValid, hasImage, create],
    update: [dishExists, hasName, hasDescription, hasPrice, hasImage, idMatch, priceIsValidForUpdate, update ],
     

}