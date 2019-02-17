const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt-nodejs");

const userSchema = new Schema({
  username: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  lastName: String,
  firstName: String,
  status: String,
  note: [Number],
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

userSchema.pre("save", function(next) {
  const user = this;

  bcrypt.genSalt(10, function(err, salt) {
    if (err) {
      return next(err);
    } else {
      bcrypt.hash(user.password, salt, null, function(err, hash) {
        if (err) {
          return next(err);
        } else {
          user.password = hash;
          next();
        }
      });
    }
  });
});

userSchema.methods.comparePassword = function(candidatePassword, callback) {
  console.log("---------------------");

  console.log(candidatePassword,this.password);
  console.log("---------------------");

  
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) {
      return callback(err);
    } else {
      callback(null, isMatch);
    }
  });
};
const ModelClass = mongoose.model("user", userSchema);

module.exports = ModelClass;
