const expect = require('chai').expect
const messages = require('consensus-core').messages
const transactions = require('consensus-core').transactions

const Customer = require('../../models/customer.js')
const Order = require('../../models/order.js')
const Invoice = require('../../models/invoice.js')


module.exports = async function(req, res, next) {
  // set body
  const body = req.body

  // validate and verify the packet
  try {
    const validatedPacket = new messages.PromiseOfPayment({
      type: 'receive',
      packet: body.packet
    })
  } catch(err) {
    next(err)
    return
  }

  // check that the id key matches the id key in the packet header
  const meta = validatedPacket.readMeta()

  try {
    expect(meta.senderId).to.equal(body.identityPublicKey)
  } catch(err) {
    next(err)
    return
  }

  // check that the id key is a registered one
  try {
    const customer = await Customer.findOne({ identityPublicKey: body.identityPublicKey })
  } catch(err) {
    next(err)
    return
  }

  if(!customer) {
    next(new Error({status: 300, message: 'customer not registered'}))
    return
  }

  // check that the orderId exists
  try {
    const order = await Order.findOne({ orderId: body.orderId })
  } catch(err) {
    next(err)
    return
  }

  if(!order) {
    next(new Error({status: 300, message: 'order does not exist'}))
    return
  }

  // retrieve the invoice for the order
  try {
    const invoice = await Invoice.findOne({ order: order._id })
  } catch(err) {
    next(err)
    return
  }

  if(!invoice) {
    next(new Error({status: 300, message: 'invoice does not exist for the given order'}))
    return
  }

  // check the transaction chain between the invoice and the promiseOfPayment by constructing the authoritative promiseOfPayment and verifying the signature of the received promiseOfPayment
  const chain = new transactions.TransactionChain({
    merchant: invoice.meta.senderId,
    customer: body.identityPublicKey,
  })

  chain.setInvoice(invoice.meta, {
    orderId: invoice.orderId,
    manifest: invoice.manifest,
    totalPreTax: invoice.totalPreTax,
    totalPostTax: invoice.totalPostTax
  })

  chain.setPromiseOfPayment(meta)

  try {
    chain.checkPromiseOfPayment()
  } catch(err) {
    next(err)
    return
  }

  // save promiseOfPayment in database with a reference to the invoice and orderId

  // respond with success status code if all of the above completes
}
