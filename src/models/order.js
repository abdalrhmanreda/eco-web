const mongoose = require('mongoose')
const Cart = require('./cart')
const Product = require('./product')
const orderSchema = new mongoose.Schema({
    products:[
        {
            productId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'Product',
                required:true
            },
            quantity:{
                type:Number,
                default:1
            }
        }
    ],
    amount:{
        type:Number,
        required:true
    },
    address:{type:Object, required:true}, // because stripe return object
    status:{
        type:String,
        default:'pending'
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    }
},
{
    timestamps:true
})


orderSchema.statics.FindCart = async function(ownerid){
const cart = await Cart.findOne({owner:ownerid})

return cart
} 

orderSchema.methods.ClearCart = async function(ownerid){
    await Cart.deleteOne({owner:ownerid})

}

orderSchema.methods.CalcTotalAmount = function()
{
    const order = this 
    let TotalAmount = 0
    order.products.forEach((singleProduct)=>{
        TotalAmount += singleProduct.productId.price*singleProduct.quantity
    })
    return TotalAmount
}

orderSchema.methods.checkAvailablequantity = async function() {
    const order = this;

    for (const product of order.products) {
        let myproduct = await Product.findOne({ _id: product.productId });

        if (product.quantity <= myproduct.quantity) {         // or <= product.productId.quantity
            myproduct.quantity -= product.quantity;
            await myproduct.save();
        } else {
            return false
        }
    }
}

const Order = mongoose.model('Order',orderSchema) 

module.exports = Order