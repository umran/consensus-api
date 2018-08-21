const mongoose = require('mongoose')
const Schema = mongoose.Schema

const merchantSchema = new Schema({
  identityPublicKey: {type: String, required: true, min: 44, max: 44},
  name: {type: String, required: true},
  email: {type: Object, required: true},
  date_modified: {type: Date, required: true}
})

const Merchant = mongoose.model('Merchant', merchantSchema)

module.exports = Merchant
