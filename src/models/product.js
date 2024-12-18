const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true,
    },
    desc:{
        type:String,
        required:true,
        trim:true,
    },
    img:{
        type:Buffer,
        required:true
    },
    categories:{
        type:Array,
    },
    size:{
        type:String,
    },
    color:{
        type:String,

    },
    price:{
        type:Number,
        required:true,
    },
    quantity:{
        type:Number,
        required:true,
    }
},
{
    timestamps:true
})


const Product = mongoose.model('Product',productSchema) 

module.exports = Product