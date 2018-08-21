const mongoose = require('mongoose')

const Merchant = require('../src/models/merchant')
const Customer = require('../src/models/customer')
const Authority = require('../src/models/authority')

mongoose.connect('mongodb://127.0.0.1:27018/consensus')
mongoose.connection.on('connected', function(){
  console.log("Connection to mongodb established")
})
mongoose.connection.on('error', function(err){
  console.log(err)
})
mongoose.connection.on('disconnected', function(){
  console.log("Connection to mongodb disconnected")
})

const genParties = async function() {
  var merchant = new Merchant({
    identityPublicKey: "0Yb9cx/zsicRh0HtoLTxPMeE2yDdrK5AQ2MiW/bA15M=",
    name: "STO",
    email: "sales@sto.com.mv",
    date_modified: new Date()
  })

  try {
    merchant = await merchant.save()
  } catch(err) {
    console.log(err)
    return
  }

  var customer = new Customer({
    identityPublicKey: "bDT+leA94vs6qrLWjMZoS6/OsAHxiesh89ppyl1oYPk=",
    name: "Ali Hussain",
    email: "ali.hussain@majilis.gov.mv",
    date_modified: new Date()
  })

  try {
    customer = await customer.save()
  } catch(err) {
    console.log(err)
    return
  }

  var authority = new Authority({
    identityPublicKey: "9LLDEV9ewbB7b2hxgnr4LpBTmiGES5XBWH/fCV+aGaQ=",
    name: "IntelliTrust",
    email: "contact@intellitrust.io",
    date_modified: new Date()
  })

  try {
    authority = await authority.save()
  } catch(err) {
    console.log(err)
    return
  }
}

genParties()
