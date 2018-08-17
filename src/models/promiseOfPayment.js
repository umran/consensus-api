const mongoose = require('mongoose')
const Schema = mongoose.Schema

const promiseOfPaymentSchema = new Schema({
  order: {type: Schema.Types.ObjectId, required: true, ref: 'Order'},
  invoice: {type: Schema.Types.ObjectId, required: true, ref: 'Invoice'},
  meta: {type: Object, required: true},
  date_modified: {type: Date, required: true}
})

const PromiseOfPayment = mongoose.model('PromiseOfPayment', promiseOfPaymentSchema)

module.exports = PromiseOfPayment
