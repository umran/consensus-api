const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const validators = require('./validators')
const messages = require('./handlers/messages')
const errorHandler = require('./errorHandler')

app.use(bodyParser.json())

app.post('/messages/invoice', validators.messageRequest, messages.invoice)
app.post('/messages/promise_of_payment', validators.messageRequest, messages.promiseOfPayment)
app.post('/messages/escrow_contract', validators.messageRequest, messages.escrowContract)
app.post('/messages/proof_of_delivery', validators.messageRequest, messages.proofOfDelivery)

app.use(errorHandler)

module.exports = app
