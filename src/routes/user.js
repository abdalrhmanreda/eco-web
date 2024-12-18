const express = require('express');
const router = express.Router();
const User = require('../models/user');
const {auth,authAndAdmin,Admin} = require('../middleware/auth');
const multer = require('multer')
const sharp = require('sharp')
const {sendEmail,sendCanelationEmail} = require('../emails/account')

//signup 
router.post('/users',async(req,res)=>{
    const user = new User(req.body); // user
    try{
        await user.save(); // save db
        const token = await user.generateAuthToken(); // token id 30d
        sendEmail(user.email,user.name); // send email
        res.status(201).send({user,token})
    }catch(e){
        res.status(400).send(e)
    }
})
//login 
router.post('/users/login',async(req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password) // Credentials 
        const token = await user.generateAuthToken();
        res.status(200).send({user,token})

    }catch(e){
        res.status(400).send(e)
    }
})

//read profile
router.get('/users/profile',auth,(req,res)=>{
    try{
        res.send(req.user)
    }catch(e){
        res.status(500).send(e)
    }
})

// admin read account by id 
router.get('/users/:id',Admin,async(req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        res.status(200).send(user)
    }catch(e){
        res.status(404).send()
    }
})

// admin read All accounts  
router.get('/users',Admin,async(req,res)=>{
    const query = req.query.new
    try{
        const users = query
        ?await User.find().sort({_id:-1}).limit(5)
        :await User.find()
        res.status(200).send(users)
    }catch(e){
        res.status(500).send()
    }
})

//update profile
router.patch('/users/me',authAndAdmin,async(req,res)=>{
const updates = Object.keys(req.body) // get keys
const allowedUpdates = ['name', 'email', 'password','age'] // 

const isValidUpdate =updates.every(update=>allowedUpdates.includes(update))
if(!isValidUpdate){
    return res.status(400).send({error:"Invalid update"})
}
try{
    updates.forEach((update)=>{req.user[update]=req.body[update]})
    await req.user.save()
    res.status(200).send(req.user)
}catch(e){
    res.status(400).send(e)
}
})
// logout
router.post('/users/Logout',auth,async(req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send(e)
    }
})

// log out from all devices 
router.post('/users/LogoutAll',auth,async(req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send(e)
    }
})
// delete profile 
router.delete('/users/me',auth,async(req,res)=>{
    try{
        await req.user.remove()
        sendCanelationEmail(req.user.email,req.user.name)
        res.send(req.user)
    }catch(e){
        res.status(500).send(e)
    }
})

// create avatar
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

// image pressess and save
router.post('/users/me/avatar',auth,upload.single('avatar'),async(req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
},(err,req,res,next)=>{
    res.status(400).send({error:err.message})
})


// delete avatar if exist
router.delete('/users/me/avatar',auth,async(req,res)=>{
    try{
        if(!req.user.avatar){
            return res.status(404).send('There is no avatar available')
        }
    req.user.avatar = undefined
    await req.user.save()
    res.send()
    }catch(e){
        res.status(404).send({error:e.message})
    }
})

router.get('/users/:id/avatar',auth,async(req,res)=>{
    const user = await User.findById(req.params.id)
    try{
        if(!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    }catch(e){
        res.status(404).send(e)
    }
})

module.exports = router
