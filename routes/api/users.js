const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

//Load imput validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

//Load user model

const User = require('../../models/User');

// @route         Get api/users/test
// @description   Tests users route
// @access        Private


router.get('/test', (req, res)=> res.json({
  msg: 'Users Works'
}));


// @route         POST api/users/register
// @description   Register user
// @access        Public

router.post('/register', (req, res) =>{
  const { errors, isValid } = validateRegisterInput(req.body);

  //Check Validation
  if(!isValid){
    return res.status(400).json(errors);
  }

  User.findOne({
    email: req.body.email
  }).then(user =>{
    if(user){
      errors.email = 'Email already exists. Please login';
      return res.status(400).json({errors});
    } else {
        const avatar = gravatar.url(req.body.email, {
          s: '200', //size of photo
          r: 'pg', // picture rating
          d: 'mm' //  default pic image setting
        });

        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          avatar,
          password: req.body.password
        });

        bcrypt.genSalt(10, (err, salt) =>{
          bcrypt.hash(newUser.password, salt, (err, hash)=>{
            if(err) throw err;
            newUser.password = hash;
            newUser.save()
              .then(user => res.json(user))
              .catch(err => console.log(err));
          })
        })
      }
    });
});



// @route        POST api/users/login
// @description   Login User/ Returning JWT (JSON Web Token)Token
// @access        Public

router.post('/login', (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  //Check Validation
  if(!isValid){
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;

  //Find user by Email
  User.findOne({email})
    .then(user=> {
      //Check for user
      if(!user){
        errors.email = 'Incorrect user/password combination'
        return res.status(404).json(errors);
      }
      //Check password
      bcrypt.compare(password, user.password)
        .then(isMatch => {
          if(isMatch){
            //User matched
            const payload = {
              id: user.id,
              name: user.name,
              avatar: user.avatar
            };

            // Sign token
            jwt.sign(
              payload,
              keys.secretOrKey,
              {expiresIn: 3600 },
              (err, token)=>{
                res.json({
                  success: true,
                  token: 'Bearer '+ token
                });
              });
          } else {
            errors.password = 'Incorrect user/password combination'
            return res.status(400).json(errors)
          }
        });
    });
});

// @route         Get api/users/current
// @description   Return current user
// @access        Private

router.get('/current', passport.authenticate('jwt', {session: false}), (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email
  });
});

//helper

module.exports = router;
