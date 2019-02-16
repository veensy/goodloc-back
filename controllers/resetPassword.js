const User = require("../models/user");

exports.resetPassword = (req, res, next) => {
  console.log(req.query.newToken);

  User.findOne({
    resetPasswordToken: req.query.newToken,
    resetPasswordExpires: { $gt: Date.now() }
  }).then(user => {
    console.log(user);
    if (user == null) {
      console.log("Password reset link is invalid or has expired");
      res.json("Password reset link is invalid or has expired");
    } else {
      res.status(200).send({
        email: user.email,
        validate: "Password reset link is ok"
      });
    }
  });
};
