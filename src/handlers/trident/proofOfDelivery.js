const expect = require('chai').expect
const trident = require('consensus-core').protocols.trident
const transactions = require('consensus-core').transactions

const Customer = require('../../models/customer')
const Order = require('../../models/order')
const EscrowContract = require('../../models/escrowContract')
const ProofOfDelivery = require('../../models/proofOfDelivery')


module.exports = async function(req, res, next) {
  // set body
  const body = req.body

  // validate and verify the packet
  try {
    var validatedPacket = new trident.ProofOfDelivery({
      type: 'receive',
      packet: body.packet
    })
  } catch(err) {
    console.log('packet validation or verification failure')
    next(err)
    return
  }

  // check that the id key matches the id key in the packet header
  const meta = validatedPacket.readMeta()

  try {
    expect(meta.senderId).to.equal(body.identityPublicKey)
  } catch(err) {
    console.log('idkey equivalence failure')
    next(err)
    return
  }

  // check that the id key is a registered one
  try {
    var customer = await Customer.findOne({ identityPublicKey: body.identityPublicKey })
  } catch(err) {
    console.log('idkey lookup failure')
    next(err)
    return
  }

  if(!customer) {
    console.log('customer not registered')
    next(new Error({status: 300, message: 'customer not registered'}))
    return
  }

  // check that the orderId exists
  try {
    var order = await Order.findOne({ orderId: body.orderId })
  } catch(err) {
    console.log('orderid lookup failure')
    next(err)
    return
  }

  if(!order) {
    console.log('order id does not exist')
    next(new Error({status: 300, message: 'order does not exist'}))
    return
  }

  // retrieve the escrowContract for the order
  try {
    var escrowContract = await EscrowContract.findOne({ order: order._id }).populate({
      path: 'promiseOfPayment',
      populate: {
        path: 'invoice'
      }
    })
  } catch(err) {
    console.log('escrowContract lookup failure')
    next(err)
    return
  }

  if(!escrowContract) {
    console.log('escrowContract does not exist')
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
    console.log('chain verification failure')
    next(err)
    return
  }

  // save proofOfDelivery in database with a reference to the escrowContract and orderId
  var proofOfDelivery = new ProofOfDelivery({
    order: order._id,
    escrowContract: escrowContract._id,
    meta: meta,
    date_modified: new Date()
  })

  try{
    proofOfDelivery = proofOfDelivery.save()
  } catch(err) {
    console.log('proofOfDelivery save faiure')
    next(err)
    return
  }

  // respond with success status code if all of the above completes
  res.json({status: 200, message: 'proofOfDelivery accepted'})
}
