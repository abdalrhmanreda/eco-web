const express = require('express');
const {auth,Admin,authAndAdmin} = require('../middleware/auth');
const Order = require('../models/order');
const router = express.Router();

// Take cart and do order and clear cart after order 
router.post('/order',auth,async(req,res)=>{
    const cart = await Order.FindCart(req.user.id)
    if(!cart) {
        return res.status(404).send('Your Cart is Empty')
    }
    let {products} = cart
    const order = new Order({  
        owner:req.user._id,
        products,
        amount:0,
        ...req.body
    })
    
    try{
        await order.populate('products.productId').execPopulate()
        TotalAmount = order.CalcTotalAmount()
        order.amount=TotalAmount
        checker= await order.checkAvailablequantity()
        if(checker === false){
            return res.status(404).send('quantity is not available')
        }
        await order.save();
        await order.ClearCart(req.user.id)
        res.status(201).send(order)
        }catch(e){
            res.status(400).send(e)
        }
    
})

// Admin Update order 
 router.patch('/order/update/:id',Admin,async(req,res)=>{
    const updates = Object.keys(req.body)
    try{
        const order = await Order.findById({_id:req.params.id})
        updates.forEach((update)=>{
                order[update] = req.body[update];
        })
        await order.save()
        res.status(200).send(order)
    }catch(e){
        res.status(400).send(e)
    }
})
// Only Admin can delete order 
router.delete('/order/delete/:id',Admin,async(req,res)=>{
    try{
        await Order.findByIdAndDelete(req.params.id)
        res.status(200).send("Order has been deleted")  
    }catch(e){
        res.status(400).send(e)
    }    
})
// Admin get user orders 
router.get('/order/:owner',Admin,async(req,res)=>{
    try{
        const orders =await Order.find({owner:req.params.owner})
        res.status(200).send(orders)  
    }catch(e){
        res.status(404).send(e)
    }    
})

// user get his orders
router.get('/myorders',auth,async(req,res)=>{
    try{
        const orders =await Order.find({owner:req.user._id})
        res.status(200).send(orders)  
    }catch(e){
        res.status(404).send(e)
    }  
})

// // Admin get all orders
router.get('/orders',Admin,async(req,res)=>{
    try{
        const orders =await Order.find()
        res.status(200).send(orders)  
    }catch(e){
        res.status(404).send(e)
    }    
})

module.exports = router

