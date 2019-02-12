const User = require("../models/user");
const jwt = require("jwt-simple");
const config = require("../config");

const tokenForUser = user => {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
};

exports.signin = (req, res, next) => {
  res.send({ token: tokenForUser(req.user) });
};

exports.signup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirm_password = req.body.confirm_password;
  if (!email || !password || password !== confirm_password) {
    console.log(req.body);
    return res
      .status(422)
      .send({
        error: "You must provide email and same password"
      });
  } else {
    User.findOne({ email: email }, (err, existingUser) => {
      if (err) {
        return next(err);
      }
      if (existingUser) {
        return res.status(422).send({ error: "Email is in use" });
      }

      if (!existingUser) {
        const user = new User({ email: email, password: password });
        user.save(err => {
          if (err) {
            return next(err);
          } else {
            res.json({ token: tokenForUser(user) });
          }
        });
      }
    });
  }
};
