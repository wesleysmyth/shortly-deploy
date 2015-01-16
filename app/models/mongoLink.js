var mongoose = require('mongoose');
var crypto = require('crypto');
var Schema = mongoose.Schema;

var linkSchema = new Schema({
  url:  String,
  base_url: String,
  code:   String,
  title: String,
  visits: {type: Number, default: 0}
});


linkSchema.pre('save', function(next) {
  var link = this;
  var shasum = crypto.createHash('sha1');
  shasum.update(link.url);
  link.code = shasum.digest('hex').slice(0, 5);
  next();
});

module.exports = mongoose.model('Link', linkSchema);
