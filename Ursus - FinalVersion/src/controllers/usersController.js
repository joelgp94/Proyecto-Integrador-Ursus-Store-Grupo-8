const fs = require ('fs');
const path = require ('path');
const {validationResult} = require("express-validator")
const bcryptjs = require("bcryptjs")
const User = require("../models/Users")


let usersController = {
      register: function (req,res) {
         res.render('users/register')
      },
    
      processRegister: function (req,res) {
         const resultValidation = validationResult(req)
        
         if(resultValidation.errors.length > 0) {
         return res.render("users/register", {
            errors: resultValidation.mapped(),
            oldData: req.body
         })
         }
         
         let userDb = User.findByField("email", req.body.email)
    
         if(userDb){
            return res.render("users/register", {
               errors: {
                  email: {
                     msg: "Este email ya esta en uso"
                  }
               },
               oldData: req.body
            })
         }
         
         let userToCreate = {
            ...req.body,
            password: bcryptjs.hashSync(req.body.password, 10),
            imagenUser: req.file.filename
         }

        let userCreated = User.create(userToCreate)
        res.redirect("/login")
      },
    
      login: function (req,res) {
        res.render('users/login')
      },
      
      processLogin: function (req,res){
         let userLogin = User.findByField("email", req.body.email)
         
         if(userLogin){
            let verficationPassword = bcryptjs.compareSync(req.body.password, userLogin.password)
            
            if(verficationPassword){
               delete userLogin.password;
               req.session.userLogged = userLogin;
               
               if(req.body.recodar){
                  res.cookie("cookieUser", req.body.email, {maxAge: (1000 * 60)})
               }
               
               return res.redirect("/profile")
            };
         }
         
         res.render("users/login", {
            errors: {
               email : {
                  msg: "Las credenciales son incorrectas"
               }
            }
         })

         res.render("users/login", {
            errors: {
               email : {
                  msg: "Mail no registrado"
               }
            }
         })
      },
      
      profile: function (req, res) {
         return res.render('users/userProfile', {
            user: req.session.userLogged
         });
      },

      logout: function (req, res) {
         req.clearCookie("cookieUser")
         req.session.destroy()
         return res.redirect("/")
      }

}


module.exports = usersController;