const express = require('express');
const Product = require('../models/product');
const router = express.Router();
const {Admin}=require('../middleware/auth')
const multer = require('multer');
const sharp = require('sharp');

const upload = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|png|jpeg)$/)){
            return cb(new Error('Please provide only images'))
        }
        cb(undefined,true)
    }
})
// create product
router.post('/products',Admin,upload.single('image'),async(req,res)=>{
   let buffer
    if(req.file){
        buffer =await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    }
        const product = new Product({...req.body,img:buffer});
        try{
            await product.save();
            res.status(201).send(product)
        }catch(e){
            res.status(400).send(e)
        }
})
// update product 
router.patch('/products/update/:id',Admin,upload.single('image'),async(req,res)=>{
    const updates = Object.keys(req.body) 
    try{
        const product = await Product.findById(req.params.id)
        if (req.file) {
            const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
            product.img = buffer;
        }
        updates.forEach((update)=>{
            if (update !== 'image') {
                product[update] = req.body[update];
            }
        })
        await product.save()
        res.status(200).send(product)
    }catch(e){
        res.status(400).send(e)
    }
})
// Delete product
router.delete('/products/delete/:id',Admin,async(req,res)=>{
    try{
        await Product.findByIdAndDelete(req.params.id)
        res.status(200).send("Product has been deleted")  
    }catch(e){
        res.status(400).send(e)
    }    
})
// get product
router.get('/products/:id',async(req,res)=>{
    try{
        const product =await Product.findById(req.params.id)
        res.status(200).send(product)  
    }catch(e){
        res.status(404).send(e)
    }    
})
// get all products
router.get('/allproducts',async(req,res)=>{
    const qNew = req.query.new
    const qCat = req.query.category
    try{
        let products
        if(qNew){
           products = await Product.find().sort({createdAt:-1}).limit(5)
        }else if(qCat){
            products = await Product.find({
                categories:{
                    $in:[qCat]
                }
            })
        }else{
             products =await Product.find()
        }
        res.status(200).send(products)  
    }catch(e){
        res.status(404).send(e)
    }    
})






module.exports = router