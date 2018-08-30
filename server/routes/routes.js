const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
const passport = require('passport');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    serivce: 'gmail',
    auth: {
        user: 'vyacheslav@code-care.pro',
        pass: 'Slava@0756'
    }
});

let mailOptions = {
    from: '"slava" <vyacheslav@code-care.pro',
    to: null,
    subject: 'verification',
    text: 'please use this link to verify your email ',
};

let User = require('../models/user');

mongoose.connect('mongodb://localhost/users', {useNewUrlParser: true});

// TODO: implement email verification
// TODO: hash pass
/* is it safe to transfer unhashed password
in request or will be better to hash it on front
and then transfer already hashed */

User.findOneAndUpdate({email: 'email@me'}, 
    {email:'mcrashsm1le@gmail.com'},
    {new: true},
    (err, result) => {
        if(err) console.error(err);
        console.log(result);
    });

   // mailOptions.to = user.email;
//console.log(user);

router.post('/registration', (req, res, next) => {
    let user = new User(req.body);
    user.emailHash = Math.random().toString(36).substring(2, 15) + 
    Math.random().toString(36).substring(2, 15);
    user.save(async (err, res) => {
        if(err) {
            res.status(500).json(err);
        }
        //TODO: implement email confirm here
        try {
            mailOptions.to = user.email;
            mailOptions.text += user.emailHash;
            let result = await sendVerification(user.emailHash);
            console.log('message sent: ', result);
        } catch (e) {
            console.error(err);
        }
        res.status(200).json({'success':'success'});
    });
});

let sendVerification = (hash) => {
    transporter.sendMail(mailOptions, (err, info) => {
        if(err) {
            reject(err);
        }
        resolve(info.messageI);
    });
}

//TODO: implement this endpoint when will have an email for sending msgs
router.get('/confirm/:hash', (req, res, next) => {
    
});

router.post('/login', (req, res, next) => {

});



module.exports = router;