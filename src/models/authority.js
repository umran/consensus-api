const mongoose = require('mongoose')
const Schema = mongoose.Schema

const authoritySchema = new Schema({
  identityPublicKey: {type: String, required: true, min: 44, max: 44},
  name: {type: String, required: true},
  email: {type: Object, required: true},
  date_modified: {type: Date, required: true}
})

const Authority = mongoose.model('Authority', authoritySchema)

module.exports = Authority
