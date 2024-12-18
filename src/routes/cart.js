const express = require('express');
const {auth} = require('../middleware/auth');
const Cart = require('../models/cart');
const router = express.Router();

router.post('/cart/:prodtid', auth, async (req, res) => {
    const productId = req.params.prodtid;
    const quantity = parseInt(req.body.quantity);

    if (!productId) {
        return res.status(400).send({ error: 'productId is required.' });
    }

    try {
        let cart = await Cart.findOne({ owner: req.user.id }).populate('products.productId')

        if (!cart) {
            cart = new Cart({ owner: req.user.id, products: [{ productId, quantity }] })
            await cart.populate('products.productId').execPopulate()
        } else {
            let existingProduct = cart.products.find(product => product.productId._id.toString() === productId);

            if (existingProduct) {
                existingProduct.quantity += quantity
            } else {
                cart.products.push({ productId, quantity })
            }
        }
        await cart.save()
        res.status(201).send(cart)
    } catch (err) {
        res.status(400).send({ error: err.message })
    }
});



// wnat to make user read his own cart 
router.get('/user/mycart',auth,async(req,res)=>{
    try{
        const mycart = await Cart.find({owner:req.user.id}).populate('products.productId')
        res.status(200).send(mycart)
    }catch(e){
        res.status(403).send(e)
    }
})

// user can update his own cart 
router.patch('/cart/update/:prodId', auth, async (req, res) => {
    const productId = req.params.prodId
    const { quantity } = req.body
  
    try {
        const updatedCart = await Cart.findOneAndUpdate(
            { 'products.productId': productId, owner: req.user.id },
            { $set: { 'products.$.quantity': quantity } },
            { new: true }
        );

        if (!updatedCart) {
            return res.status(404).send({ error: 'Cart not found or product not in cart' });
        }

         res.status(200).send(updatedCart);
    } catch (e) {
         res.status(500).send({ error: 'Internal server error' ,e });
    }
});

// delte my cart or clear cart  
router.delete('/cart/delete',auth,async(req,res)=>{
    try{
        await Cart.findOneAndDelete({owner: req.user.id})
        res.status(200).send("Cart has been deleted")  
    }catch(e){
        res.status(400).send(e)
    }    
})

module.exports = router