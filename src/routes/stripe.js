const router = require('express').Router();
const stripe = require('stripe')(process.env.STRIPE_KEY)
router.post('/payment',(req,res)=>{
    stripe.charges.create(
        {
            source:req.body.tokenId,
            amount:req.body.amount,
            currency:"usd"
        },
        (stripeERR,stripeRES)=>{
            if(stripeERR){
                res.status(403).send(stripeERR);
            }else{
                res.status(200).send(stripeRES);
            }
        }
    )
})


module.exports = router