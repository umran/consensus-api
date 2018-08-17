const expect = require('chai').expect
const messages = require('consensus-core').messages
const Merchant = require('../../models/merchant.js')
const Order = require('../../models/order.js')
const Invoice = require('../../models/invoice.js')


module.exports = async function(req, res, next) {
  // set body
  const body = req.body

  // validate and verify the packet
  try {
    const validatedPacket = new messages.Invoice({
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

  // check that the order id received in the request matches the order id set in the invoice message
  const message = validatedPacket.readMessage()

  try {
    expect(message.orderId).to.equal(body.orderId)
  } catch(err) {
    next(err)
    return
  }

  // check that the id key is a registered one
  try {
    const merchant = await Merchant.findOne({ identityPublicKey: body.identityPublicKey })
  } catch(err) {
    next(err)
    return
  }

  if(!merchant) {
    next(new Error({status: 300, message: 'merchant not registered'}))
    return
  }

  // check that the order id does not already exist
  try {
    const order = await Order.findOne({ orderId: body.orderId })
  } catch(err) {
    next(err)
    return
  }

  if(order) {
    next(new Error({status: 300, message: 'order already exists'}))
    return
  }

  // check that an invoice does not already exist under the order
  try {
    const invoice = await Invoice.findOne({ order: order._id })
  } catch(err) {
    next(err)
    return
  }

  if(invoice) {
    next(new Error({status: 300, message: 'invoice already exists under order'}))
    return
  }

  // save invoice in database with a reference to orderId

  // respond with success status code if all of the above completes
}
