var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 
const Music = new Schema({
  login: String,
  email: String,
  creationDate: Date
});

module.exports = mongoose.model('music', Music);;