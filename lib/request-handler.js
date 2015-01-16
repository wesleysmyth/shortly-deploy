var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');
var mongoose = require('mongoose');

var db = require('../app/config');
// var User = require('../app/models/user');
// var Link = require('../app/models/link');
// var Users = require('../app/collections/users');
// var Links = require('../app/collections/links');
var User = require('../app/models/mongoUser');
var Link = require('../app/models/mongoLink');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links);
  })
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  Link.find({url: uri}, function(error, response) {
    if (error) {console.log('link find error ', error)};
    if (response.length > 0) {
      console.log(response[0]);
      res.send(200, response[0]);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }
        var newLink = new Link({url: uri, base_url: req.headers.origin, title: title});
        console.log('made it to this crazy block #3', newLink);
        newLink.save(function(error, newLink) {
          if (error) {console.log('could not save link ', error)}
          res.send(200, newLink);
        });
      });
    }
  });
};

  // new Link({ url: uri }).fetch().then(function(found) {
  //   if (found) {
  //     res.send(200, found.attributes);
  //   } else {
  //     util.getUrlTitle(uri, function(err, title) {
  //       if (err) {
  //         console.log('Error reading URL heading: ', err);
  //         return res.send(404);
  //       }

  //       var link = new Link({
  //         url: uri,
  //         title: title,
  //         base_url: req.headers.origin
  //       });

  //       link.save().then(function(newLink) {
  //         Links.add(newLink);
  //         res.send(200, newLink);
  //       });
  //     });
  //   }
  // });

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  User.find({username: username}, function(error, response) {
    console.log(response);
    if (error) {console.log('couldn\'t search for user ' , error)};
    if (response.length === 0) {
      res.redirect('/login');
    } else {
      var savedUser = response[0];
      savedUser.comparePassword(password, function(error, isMatch) {
        if (isMatch) {
          util.createSession(req, res, savedUser);
        } else {
          res.redirect('/login');
        }
      });
    }
  });
};


// exports.loginUser = function(req, res) {
//   var username = req.body.username;
//   var password = req.body.password;

//   new User({ username: username })
//     .fetch()
//     .then(function(user) {
//       if (!user) {
//         res.redirect('/login');
//       } else {
//         user.comparePassword(password, function(match) {
//           if (match) {
//             util.createSession(req, res, user);
//           } else {
//             res.redirect('/login');
//           }
//         })
//       }
//   });
// };

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.find({username: username}, function(error, response) {
    if (error) {console.log('could not search for user membership')};
    if (response === []) {
      console.log(response)
      console.log('Account already exists');
      res.redirect('/signup');
    } else {
      var newUser = new User({username: username, password: password});
      newUser.save(function(err, newUser) {
        util.createSession(req, res, newUser);
      });
    }
  });
  // find in User, whether or not, user exists
  // if response
  //  redirect to signup
  // else
  //   create a new user document with username and password
  //   save the user into the database
  //   if no error
  //       assign newUser variable to user
  //       util.createSession(req, res, newUser);

  // new User({ username: username })
  //   .fetch()
  //   .then(function(user) {
  //     if (!user) {
  //       var newUser = new User({
  //         username: username,
  //         password: password
  //       });
  //       newUser.save()
  //         .then(function(newUser) {
  //           util.createSession(req, res, newUser);
  //           Users.add(newUser);
  //         });
  //     } else {
  //       console.log('Account already exists');
  //       res.redirect('/signup');
  //     }
  //   })
};

exports.navToLink = function(req, res) {
  console.log(req.params);
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      link.set({ visits: link.get('visits') + 1 })
        .save()
        .then(function() {
          return res.redirect(link.get('url'));
        });
    }
  });
};
