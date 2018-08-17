const mongoose = require('mongoose')
const Schema = mongoose.Schema

const orderSchema = new Schema({
  orderId: {type: String, required: true, min: 64, max: 64},
  date_modified: {type: Date, required: true}
})

const Order = mongoose.model('Order', orderSchema)

module.exports = Order
