const express = require('express')
const app = express()
require('./db/mongoose.js')
const userRouter = require('./routes/user') 
const productRouter = require('./routes/product')
const orderRouter = require('./routes/order')
const cartRouter = require('./routes/cart')
const stripeRouter = require('./routes/stripe')
const cors = require('cors')

app.use(cors())
app.use(express.json()) // json ==>> obj
app.use(userRouter)
app.use(cartRouter)
app.use(orderRouter)
app.use(productRouter)
app.use(stripeRouter)

module.exports = app
