const User = require("../models/user");
const jwt = require("jwt-simple");
const config = require("../config");
const nodemailer = require("nodemailer");

const tokenForUser = user => {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
};

exports.forgotPassword = (req, res, next) => {
  console.log(req.body, "email");

  const email = req.body.email;
  const mailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || email === "" || !email.match(mailFormat)) {
    res.json("valid email required");
  }
  console.log(req.body.email);

  User.findOne(
    {
      email: email
    },
    (err, user) => {
      if (err) {
        console.log("email not in database", user);
        res.json("email not in db");
      } else if (user) {
        const newToken = tokenForUser(user);
        console.log(newToken);

        user.update({
          resetPasswordToken: newToken,
          resetPasswordExpires: Date.now() + 360000
        });
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: `${process.env.EMAIL_ADDRESS}`,
            password: `${process.env.EMAIL_PASSWORD}`
          }
        });
        const mailOption = {
          from: "veensy@gmail.com",
          to: `${user.email}`,
          subject: `Link To Reset Password`,
          text:
            `You received this email because you (or someone else ) have requested the reset of the password for your account.${" "}` +
            `Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:${" "}` +
            `http://localhost/3090/reset/${newToken} ${" "}` +
            `Ìf you did not request this, please ignore this email and your password will remain unchanged.`
        };
        console.log("sending email");
        transporter.sendMail(mailOption, (err, response) => {
          if (err) {
            console.error("there was an error", err);
            return next(err);
          } else {
            console.log("here is the res: ", response);
            res.status(200).json("recovery email sent");
          }
        });
      }
    }
  );
};
