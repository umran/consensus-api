const expect = require('chai').expect
const trident = require('consensus-core').protocols.trident

const Merchant = require('../../models/merchant')
const Order = require('../../models/order')
const Invoice = require('../../models/invoice')


module.exports = async function(req, res, next) {
  // set body
  const body = req.body

  // validate and verify the packet
  try {
    var validatedPacket = new trident.Invoice({
      type: 'receive',
      packet: body.packet
    })
  } catch(err) {
    console.log('packet validation and verification error')
    next(err)
    return
  }

  // check that the id key matches the id key in the packet header
  const meta = validatedPacket.readMeta()

  try {
    expect(meta.senderId).to.equal(body.identityPublicKey)
  } catch(err) {
    console.log('packet request identityPublicKey equivalence error')
    next(err)
    return
  }

  // check that the order id received in the request matches the order id set in the invoice message
  const message = validatedPacket.readMessage()

  try {
    expect(message.orderId).to.equal(body.orderId)
  } catch(err) {
    console.log('packet request orderId equivalence error')
    next(err)
    return
  }

  // check that the id key is a registered one
  try {
    var merchant = await Merchant.findOne({ identityPublicKey: body.identityPublicKey })
  } catch(err) {
    console.log('merchant lookup error')
    next(err)
    return
  }

  if(!merchant) {
    console.log('merchant not registered error')
    next(new Error({status: 300, message: 'merchant not registered'}))
    return
  }

  // check that the order id does not already exist
  try {
    var order = await Order.findOne({ orderId: body.orderId })
  } catch(err) {
    console.log('order lookup error')
    next(err)
    return
  }

  if(order) {
    console.log('order already exists error')
    next(new Error({status: 300, message: 'order already exists'}))
    return
  }

  // check that an invoice does not already exist under the order
  try {
    var invoice = await Invoice.findOne({ orderId: body.orderId })
  } catch(err) {
    console.log('invoice lookup error')
    next(err)
    return
  }

  if(invoice) {
    console.log('invoice already exists error')
    next(new Error({status: 300, message: 'invoice already exists under order'}))
    return
  }

  // create order
  order = new Order({
    orderId: body.orderId,
    date_modified: new Date()
  })

  try {
    order = await order.save()
  } catch(err) {
    console.log('order save error')
    next(err)
    return
  }

  // save invoice in database with a reference to orderId
  invoice = new Invoice({
    order: order._id,
    orderId: body.orderId,
    manifest: message.manifest,
    totalPreTax: message.totalPreTax,
    totalPostTax: message.totalPostTax,
    meta: meta,
    date_modified: new Date()
  })

  try {
    invoice = await invoice.save()
  } catch(err) {
    console.log('invoice save error')
    next(err)
    return
  }

  // respond with success status code
  res.json({status: 200, message: 'invoice accepted'})

}
