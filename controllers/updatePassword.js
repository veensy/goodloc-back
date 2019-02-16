const User = require("../models/user");
const bcrypt = require("bcrypt-nodejs");

const BCRYPT_SALT = 10
exports.updatepassword = (req,res,next ) =>{
    const email = req.body.email
    const password = req.body.password
    User.findOne({
        email:email
    }).then(user=>{
        if(user!==null){
            console.log('Email exist in database')
            bcrypt.hash(password,BCRYPT_SALT).then(hashedPassword =>{
                user.update({
                    password: hashedPassword,
                    resetPasswordToken: null,
    resetPasswordExpires: null

                })
            }).then(()=>{
                console.log('Password updated')
                res.status(200).send({message: 'Password updated'})
            })  
        }else{
            console.log("No email exists in our database to update")
            res.status(404).json('No email exists in our database to update')
        }
    })
}