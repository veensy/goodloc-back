const User = require("../models/user");
const jwt = require("jwt-simple");
const config = require("../config");
const nodemailer = require("nodemailer");
require("dotenv").config();

const tokenForUser = user => {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
};

exports.resendemaillink = (req, res, next) => {
  console.log(req.body);
  res.send({ test: "test" });

  const email = req.body.useremail;
  User.findOne({ email: email }, (err, user) => {
    if (!user) {
      return res.status(400).send({
        errorMessage: "We were unable to find a user with that email."
      });
    }
    if (user.isVerified) {
      return res.status(400).send({
        errorMessage: "This account has already been verified. Please log in."
      });
    }
    const TokenForConfirmEmail = tokenForUser(user);

    user
      .update({
        TokenForConfirmEmail: TokenForConfirmEmail,
        TokenForConfirmEmailExpirationDate: Date.now() + 360000
      })
      .then(user => {
        console.log("-----------------------------------");

        console.log(TokenForConfirmEmail);
        console.log("-----------------------------------");

        console.log(user);
        console.log("-----------------------------------");
      })
      .catch(err => {
        console.log(err);
      });

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
      subject: `Account Verification Token`,
      text:
        `Hello,\n\nPlease verify your account by clicking the link:${" "}` +
        `http://localhost:3000/confirmation/${TokenForConfirmEmail} ${" "}`
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
        res.status(200).json("Recovery email sent to " + user.email);
      }
    });
  });
};
