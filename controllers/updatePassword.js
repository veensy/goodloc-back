const User = require("../models/user");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("jwt-simple");
const config = require("../config");

const tokenForUser = user => {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
};
exports.updatepassword = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log("-----------------------------------");

  console.log(req.body);
  console.log("-----------------------------------");

  User.findOne({
    email: email
  }).then(user => {
    if (user !== null) {
      console.log("-----------------------------------");
      console.log("Email exist in database");
      console.log("-----------------------------------");

      console.log(user);
      console.log("-----------------------------------");
      console.log(password);
      console.log("-----------------------------------");

      user.password = password;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      user.save(err => {
        if (err) {
          return next(err);
        } else {
          console.log("Password updated");
          res.json({
            message: "Password updated",
            token: tokenForUser(user)
          });
        }
      });

     
    } else {
      console.log("Email not in database");
      res.json("Email not in database");
    }
  });
};
