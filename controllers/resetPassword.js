const User = require("../models/user");

exports.resetPassword = (req, res, next) => {
  User.findOne({
    resetPasswordToken: req.query.resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() }
  }).then(user => {
    if (user == null) {
      console.log("password reset link is invalid or has expired");
      res.json("password reset link is invalid or has expired");
    }else{
        res.status(200).send({
            email: user.email,
            validate: "password reset link is ok"
        })
    }
  });
};
