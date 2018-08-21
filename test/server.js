const mongoose = require('mongoose')
const server = require('../lib')

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

server.listen(4000)
