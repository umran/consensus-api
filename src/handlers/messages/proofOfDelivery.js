const expect = require('chai').expect
const messages = require('consensus-core').messages
const transactions = require('consensus-core').transactions

const Customer = require('../../models/customer.js')
const Order = require('../../models/order.js')
const EscrowContract = require('../../models/escrowContract.js')


module.exports = async function(req, res, next) {
  // set body
  const body = req.body

  // validate and verify the packet
  try {
    const validatedPacket = new messages.ProofOfDelivery({
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

  // retrieve the escrowContract for the order
  try {
    const escrowContract = await EscrowContract.findOne({ order: order._id }).populate({
      path: 'promiseOfPayment',
      populate: {
        path: 'invoice'
      }
    })
  } catch(err) {
    next(err)
    return
  }

  if(!escrowContract) {
    next(new Error({status: 300, message: 'escrowContract does not exist for the given order'}))
    return
  }

  // check the transaction chain between the invoice, promiseOfPayment, escrowContract and proofOfDelivery by constructing the authoritative proofOfDelivery and verifying the signature of the received proofOfDelivery
  const chain = new transactions.TransactionChain({
    merchant: escrowContract.promiseOfPayment.invoice.meta.senderId,
    server: escrowContract.meta.senderId,
    customer: body.identityPublicKey,
  })

  chain.setInvoice(escrowContract.promiseOfPayment.invoice.meta, {
    orderId: escrowContract.promiseOfPayment.invoice.orderId,
    manifest: escrowContract.promiseOfPayment.invoice.manifest,
    totalPreTax: escrowContract.promiseOfPayment.invoice.totalPreTax,
    totalPostTax: escrowContract.promiseOfPayment.invoice.totalPostTax
  })

  chain.setPromiseOfPayment(escrowContract.promiseOfPayment.meta)

  chain.setEscrowContract(escrowContract.meta)

  chain.setProofOfDelivery(meta)

  try {
    chain.checkProofOfDelivery()
  } catch(err) {
    next(err)
    return
  }

  // save proofOfDelivery in database with a reference to the escrowContract and orderId

  // respond with success status code if all of the above completes
}
