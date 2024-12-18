const mongoose = require('mongoose')
const Product = require('./product')
const cartSchema = new mongoose.Schema({
    products:[
        {
            productId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'Product',
                // required:true
            },
            quantity:{
                type:Number,
                default:1
            }
        }
    ],
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    }
  
},{timestamps:true})

cartSchema.pre('save',async function (){})


const Cart = mongoose.model('Cart',cartSchema) 

module.exports = Cart