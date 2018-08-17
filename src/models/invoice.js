const mongoose = require('mongoose')
const Schema = mongoose.Schema

const invoiceSchema = new Schema({
  order: {type: Schema.Types.ObjectId, required: true, ref: 'Order'},
  orderId: {type: String, required: true, min: 64, max: 64},
  manifest: {type: Array, required: true},
  totalPreTax: {type: Number, required: true},
  totalPostTax: {type: Number, required: true},
  meta: {type: Object, required: true},
  date_modified: {type: Date, required: true}
})

const Invoice = mongoose.model('Invoice', invoiceSchema)

module.exports = Invoice
