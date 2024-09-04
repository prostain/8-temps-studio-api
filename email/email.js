'use strict';

const { Sequelize } = require('sequelize');
const { sequelize, User } = require('../lib/models');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';

require('dotenv').config();


module.exports = class EmailController {
   constructor() {
   }

   register(to){
try {

    var object = 'Acount created';
    var content = 'Merci d\'avoir créé votre compte chez 8 temps studio';
    this.sendMyEmail(to, object, content);

}catch(err){
    console.log(err)
    return res.status(500).json(err)
}

   }
  
   forgotPwd(to){
    try {
        var object = 'Acount Récupération du mot de passe';
        var content = 'aller sur ce lien pour réinitialiser votre mot de passe';
        this.sendMyEmail(to, object, content);
    
    }catch(err){
        console.log(err)
        return res.status(500).json(err)
    }
    
     }


     sendMyEmail(to, object, content){
        try {
        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,  //25,
           // secure: false,
            //service: 'gmail',
            auth: {
              user: process.env.GOOGLE_MAIL_ADRESS,
              pass: process.env.GOOGLE_MAIL_KEY
            },
            tls: {
              rejectUnauthorized: false
          },
          });
        var mailOptions = {
        from: 'noreplay@8-temps-studio.com', 
          to: to, 
         subject: object, 
          text: content
        };
      
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
    }catch(err){
        console.log(err)
        return res.status(500).json(err)
    }
     }

     resetEmailPassword(to, token){
      try {
      
          var object = 'Reset Password Link - 8tempsstudio.com';
          var content = 'You requested for reset password, kindly use this <a href="https://localhost:8080/reset-password?token=' + token + '">Reset password</a> to reset your password';
          this.sendMyEmail(to, object, content);
      
      }catch(err){
          console.log(err)
          return res.status(500).json(err)
      }
     } 
}