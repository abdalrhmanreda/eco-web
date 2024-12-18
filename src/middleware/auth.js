const jwt = require('jsonwebtoken');
const User = require('../models/user');


const auth = async(req,res,next) => {
    try{
    const token = req.header('Authorization').replace('Bearer ','') // token
    const decoded= jwt.verify(token,process.env.JWT_SECRET_KEY) // 
    const user = await User.findOne({_id:decoded._id , 'tokens.token':token})
    if(!user){
        throw new Error('Please Authenticate')
    }
    req.user = user
    req.token= token
    next()
    }catch(e){
        res.status(401).send({error:'Please authenticate'})
    }
}

const authAndAdmin = (req, res, next) => {
    auth(req, res, ()=>{
        if(req.user._id || req.user.isAdmin ){
            next()
        }else{
            res.status(401).send('You are not allowed to do that')
        }
    })
}
const Admin = (req, res, next) => {
    auth(req, res, ()=>{
        if(req.user.isAdmin){
            next()
        }else{
            res.status(401).send('You are not allowed to do that')
        }
    })
}
module.exports = {
    auth ,
    authAndAdmin,
    Admin
}

