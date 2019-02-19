const Authentification = require("./controllers/authentification");
const passportService = require("./services/passports");
const passport = require("passport");

const requireAuth = passport.authenticate("jwt", { session: false });
const requireSignin = passport.authenticate("local", { session: false });
const pass = require("./controllers/forgotPassword");
const reset = require("./controllers/resetPassword");
const update = require("./controllers/updatePassword");
const confirm = require('./controllers/authentification')
const resend =  require('./controllers/authentification')

module.exports = app => {
  app.get("/", requireAuth);

  app.post("/signin", requireSignin, Authentification.signin);

  app.post("/signup", Authentification.signup);

  app.post("/forgotpassword", pass.forgotPassword);

  app.get("/resetpassword", reset.resetPassword);

  app.put("/updatepassword", update.updatepassword);

  app.post("/confirmation", confirm.confirmationPost);

  app.post("/resend", resend.resendTokenPost);
};
