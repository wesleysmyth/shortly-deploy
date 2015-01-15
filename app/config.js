var mongoose = require('mongoose');

var connection = mongoose.connect('mongodb://localhost:27017/local');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log('yay, we connected');
});

var Schema = mongoose.Schema;

var urlSchema = new Schema({
  url:  String,
  base_url: String,
  code:   String,
  title: String,
  visits: Number
});

var userSchema = new Schema({
  username:  String,
  password: String
});


var User = mongoose.model('User', userSchema);
var Url = mongoose.model('Url', userSchema);

module.exports.User = User;
module.exports.Url = Url;

// var fred = new User({username: 'fred', password: 'zirdung'});

// fred.save(function(err, fred) {
//   if (err) { console.log(err) }
//   else {
//     console.log('fred saved!');
//   }
// });

// User.find({username: 'fred'}, function(error, response) {
//   console.log(response);
// })

// db.close();
