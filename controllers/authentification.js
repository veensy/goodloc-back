const User = require("../models/user");
const jwt = require("jwt-simple");
const config = require("../config");
const nodemailer = require("nodemailer");
require("dotenv").config();

const tokenForUser = user => {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
};
// SIGN IN
exports.signin = (req, res, next) => {
 const isMatch = req.user.pass
  const email =req.body.email;

  if(!isMatch){
    return res.send({ errorMessage:"Wrong password"})
  }
  User.findOne({ email: email }, (err, user) => { 
 
  if (!user.isVerified) {
    return res.send({
        type: "Not verified",
        errorMessage: "Your account has not been verified."
      })
  }
   if(!user.email){
    return res.send({errorMessage:"Email not found in database"})
  }
  if(user.isVerified){
    return res.json({  validate:"Valid login credentials" ,token: tokenForUser(req.user) });
  }

  })

};

// SIGN UP
exports.signup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirm_password = req.body.confirm_password;
  const lastName = req.body.lastName;
  const firstName = req.body.firstName;
  const status = req.body.status;
  const username = req.body.username;

  const mailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    !email ||
    !password ||
    password !== confirm_password ||
    !email.match(mailFormat)
  ) {
    return res.status(422).send({
      error: "You must provide a valid email and same password"
    });
  } else {
    User.findOne({ email: email }, (err, existingUser) => {
      if (err) {
        return next(err);
      }
      if (existingUser) {
        return res.json({ error: "Email is in use" });
      }

      if (!existingUser) {
        const user = new User({
          lastName: lastName,
          firstName: firstName,
          status: status,
          username: username,
          email: email,
          password: password
        });
        console.log("-----------------------------------");
        console.log(user);
        console.log("-----------------------------------");
        const TokenForConfirmEmail = tokenForUser(user);
        console.log(TokenForConfirmEmail);
        console.log("-----------------------------------");
        user.TokenForConfirmEmail = TokenForConfirmEmail;
        user.TokenExpirationDate = Date.now() + 360000;

        user.save(err => {
          if (err) {
            return next(err);
          } else {
            console.log("-----------------------------------");

            console.log(TokenForConfirmEmail);
            console.log("-----------------------------------");

            user.save(err => {
              if (err) {
                return res.status(500).send({ errorMessage: err });
              }
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
                `Hello,\n\n' + 'Please verify your account by clicking the link:${" "}` +
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
                res.status(200).json("Recovery email sent to" + user.email);
              }
            });

            //res.json({ token: tokenForUser(user) });
          }
        });
      }
    });
  }
};

// CONFIRM EMAIL
exports.confirmationPost = (req, res, next) => {
  console.log("1-----------------------------------");
  console.log(req.body.needForConfirmation.email);
  console.log("2-----------------------------------");
  console.log(
    req.body.needForConfirmation.TokenForConfirmEmail.TokenForConfirmEmail
  );
  console.log("3-----------------------------------");

  const TokenForConfirmEmail =
    req.body.needForConfirmation.TokenForConfirmEmail.TokenForConfirmEmail;

  if (TokenForConfirmEmail && req.body.needForConfirmation.email) {
    const email = req.body.needForConfirmation.email;
    User.findOne({
      TokenForConfirmEmail: TokenForConfirmEmail
    }).then(user => {
      console.log("4-----------------------------------");
      console.log(TokenForConfirmEmail);
      console.log("5-----------------------------------");
      console.log(user);
      console.log("6-----------------------------------");
      if (user.email !== email) {
        console.log("We were unable to find a user for this token.");

        return res.json({
          errorMessage: "We were unable to find a user for this token."
        });
      }
      if (user.email === email && user.isVerified) {
        console.log("7-----------------------------------");

        console.log("This user has already been verified");
        console.log("8-----------------------------------");

        return res.json({
          errorMessage: "This user has already been verified."
        });
      }
      if (user.email === email && !user.isVerified) {
        user.isVerified = true;
        user.save(err => {
          if (err) {
            return res.status(500).send({ errorMessage: err });
          } else {
            res.json({
              validate:
                "Congratulation !!! Your account has been verified. Please log in."
            });
          }
        });
      }
    });
  } else if (!req.body.needForConfirmation.email) {
    console.log("You must provide an email");

    return res.json({
      errorMessage: "You must provide an email"
    });
  } else {
    return res.json({
      errorMessage:
        "We were unable to find a valid token. Your token may have expired."
    });
  }
};

// RESEND EMAIL TOKEN
exports.resendTokenPost = (req, res, next) => {
  const email = req.body.email;
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
    token.save(err => {
      if (err) {
        return res.status(500).send({ errorMessage: err });
      }
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
        res.status(200).json("Recovery email sent to" + user.email);
      }
    });
  });
};