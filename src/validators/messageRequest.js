var Ajv = require('ajv')
const schema = require('./schemas/messageRequest.json')

var ajv = new Ajv({allErrors: true})
var validate = ajv.compile(schema)

module.exports = function(req, res, next) {
  if(!validate(req.body)) {
    next(validate.errors)
    return
  }

  next()
}
