const mongoose = require('mongoose')
const Schema = mongoose.Schema

const proofOfDeliverySchema = new Schema({
  order: {type: Schema.Types.ObjectId, required: true, ref: 'Order'},
  escrowContract: {type: Schema.Types.ObjectId, required: true, ref: 'EscrowContract'},
  meta: {type: Object, required: true},
  date_modified: {type: Date, required: true}
})

const ProofOfDelivery = mongoose.model('ProofOfDelivery', proofOfDeliverySchema)

module.exports = ProofOfDelivery
