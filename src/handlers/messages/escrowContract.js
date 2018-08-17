const expect = require('chai').expect
const messages = require('consensus-core').messages
const transactions = require('consensus-core').transactions

const Authority = require('../../models/authority.js')
const Order = require('../../models/order.js')
const PromiseOfPayment = require('../../models/promiseOfPayment.js')


module.exports = async function(req, res, next) {
  // set body
  const body = req.body

  // validate and verify the packet
  try {
    const validatedPacket = new messages.EscrowContract({
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
    const authority = await Authority.findOne({ identityPublicKey: body.identityPublicKey })
  } catch(err) {
    next(err)
    return
  }

  if(!authority) {
    next(new Error({status: 300, message: 'authority not registered'}))
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

  // retrieve the promiseOfPayment for the order
  try {
    const promiseOfPayment = await PromiseOfPayment.findOne({ order: order._id }).populate({ path: 'invoice' })
  } catch(err) {
    next(err)
    return
  }

  if(!promiseOfPayment) {
    next(new Error({status: 300, message: 'promiseOfPayment does not exist for the given order'}))
    return
  }

  // check the transaction chain between the invoice, the promiseOfPayment and the escrowContract by constructing the authoritative escrowContract and verifying the signature of the received escrowContract
  const chain = new transactions.TransactionChain({
    merchant: promiseOfPayment.invoice.meta.senderId,
    customer: promiseOfPayment.meta.senderId,
    server: body.identityPublicKey
  })

  chain.setInvoice(promiseOfPayment.invoice.meta, {
    orderId: promiseOfPayment.invoice.orderId,
    manifest: promiseOfPayment.invoice.manifest,
    totalPreTax: promiseOfPayment.invoice.totalPreTax,
    totalPostTax: promiseOfPayment.invoice.totalPostTax
  })

  chain.setPromiseOfPayment(promiseOfPayment.meta)

  chain.setEscrowContract(meta)

  try {
    chain.checkEscrowContract()
  } catch(err) {
    next(err)
    return
  }

  // save escrowContract in database with a reference to the promiseOfPayment and orderId

  // respond with success status code if all of the above completes
}
