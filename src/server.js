const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const validators = require('./validators')
const trident = require('./handlers/trident')
const errorHandler = require('./errorHandler')

app.use(bodyParser.json())

app.post('/messages/invoice', validators.messageRequest, trident.invoice)
app.post('/messages/promise_of_payment', validators.messageRequest, trident.promiseOfPayment)
app.post('/messages/escrow_contract', validators.messageRequest, trident.escrowContract)
app.post('/messages/proof_of_delivery', validators.messageRequest, trident.proofOfDelivery)

app.use(errorHandler)

module.exports = app
