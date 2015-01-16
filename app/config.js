var mongoose = require('mongoose');

var connection = mongoose.connect('mongodb://localhost:27017/local');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log('yay, we connected');
});
