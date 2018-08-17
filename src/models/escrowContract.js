const mongoose = require('mongoose')
const Schema = mongoose.Schema

const escrowContractSchema = new Schema({
  order: {type: Schema.Types.ObjectId, required: true, ref: 'Order'},
  promiseOfPayment: {type: Schema.Types.ObjectId, required: true, ref: 'PromiseOfPayment'},
  meta: {type: Object, required: true},
  date_modified: {type: Date, required: true}
})

const EscrowContract = mongoose.model('EscrowContract', escrowContractSchema)

module.exports = EscrowContract
