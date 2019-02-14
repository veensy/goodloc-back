const Authentification = require("./controllers/authentification");
const passportService = require("./services/passports");
const passport = require("passport");

const requireAuth = passport.authenticate("jwt", { session: false });
const requireSignin = passport.authenticate("local", { session: false });
const pass = require("./controllers/forgotPassword")

module.exports = app => {
  app.get("/", requireAuth, (req, res) => {
    res.send({ hi: "there" });
  });

  app.post("/signin", requireSignin, Authentification.signin);

  app.post("/signup", Authentification.signup);

  app.post("/forgotpassword",pass.forgotPassword)
    
 
};
