const User = require("../models/user");
const jwt = require("jwt-simple");
const config = require("../config");
const nodemailer = require("nodemailer");
require("dotenv").config();

const tokenForUser = user => {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
};

exports.forgotPassword = (req, res, next) => {
  const email = req.body.email;
  const mailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    res.json("You must provide an email");
  } else if (!email.match(mailFormat)) {
    res.json("The email you provide is not valid");
  }

  User.findOne({
    email: email
  }).then(user => {
    if (user === null) {
      console.log("Email not in database", user);
      res.json("Email not in db");
    } else if (user) {
      const newToken = tokenForUser(user);

      user
        .update({
          resetPasswordToken: newToken,
          resetPasswordExpires: Date.now() + 360000
        })
        .then(user => {
          console.log(user);
        })
        .catch(err => {
          console.log(error);
        });

      // user.resetPasswordToken = newToken;
      // user.resetPasswordExpires = Date.now() + 360000;

      // user.save();

      const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: `${process.env.EMAIL_ADDRESS}`,
          pass: `${process.env.EMAIL_PASSWORD}`
        }
      });

      const mailOption = {
        from: "demo@gmail.com",
        to: `${user.email}`,
        subject: `Link To Reset Password`,
        text:
          `You received this email because you (or someone else ) have requested the reset of the password for your account.${" "}` +
          `Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:${" "}` +
          `http://localhost:3000/resetpassword/${newToken} ${" "}` +
          `Ìf you did not request this, please ignore this email and your password will remain unchanged.`
      };
      console.log("sending email");
      console.log("-----------------------------------");
      transporter.sendMail(mailOption, (err, response) => {
        console.log(mailOption);

        if (err) {
          console.error("there was an error", err);
          return next(err);
        } else {
          console.log("here is the res: ", response);
          res.status(200).json("Recovery email sent");
        }
      });
    }
  });
};
