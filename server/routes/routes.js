const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
const passport = require('passport');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
router.use(bodyParser.urlencoded({
    extended: true
}));

const transporter = nodemailer.createTransport({
    /*host: 'smtp.gmail.com',
    port: 465,
    secure: true,*/
    service: 'gmail',
    auth: {
        user: 'mcrashsm1le@gmail.com',
        pass: 'Slava@0756',
    }
});

let mailOptions = {
    from: '"slava" <mcrashsm1le@gmail.com>',
    //to: null,
    subject: 'verification',
    //html: '<p> Click <a href=http://localhost:3000/confirm/'
};

let User = require('../models/user');

mongoose.connect('mongodb://localhost/users', {useNewUrlParser: true});

// TODO: implement email verification
// TODO: hash pass
/* is verification sent automatically or user presses 
some button b4? */

router.post('/registration', async (req, res, next) => {
    let user = new User(req.body);
    user.fullName = user.firstName + ' ' + user.lastName;
    user.emailVerified = user.hasSeenVideo = false;
    user.createdAt = user.lastLoginAt = user.photoUri = null;

    try {
        await User.init();
        user.emailHash = await getVerificationHash();
        user.passwordHash = await getHashPass(req.body.password);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
        return next();
    }
    saveUser(user);
    sendVerification(user.emailHash, user.email, res, next);
});

let saveUser = (user) => {
    user.save((err, result) => {
        if(err) {
            console.log(err);
            res.status(500).json(err);
            return next();
        }
        console.log('saved: ', result);
    });
}

let sendVerification = (hash, email, res, next) => {
    mailOptions.to = email;
    mailOptions.html = '<p> Click <a href="http://localhost:3000/confirm/' + hash + '"> here </a> to verify your email adress';
    transporter.sendMail(mailOptions, (err, info) => {
        if(err) {
            console.error('error while sending message');
            console.error(err);
            res.status(500).json(err);
            return next();
        }
        console.log(info);
    });
}

//hashing password
let getHashPass = (cleanPass) => {
    let encryptedPass = bcrypt.hash(cleanPass, 10);
    return encryptedPass;
}

//hash for sending it in email verification message
let getVerificationHash = () => {
    let result = '';
    let symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for(let i = 0; i < 20; i++){
        result += symbols.charAt(Math.random() * symbols.length);
    }
    return result;
}

//TODO: implement this endpoint when will have an email for sending msgs
router.get('/confirm/:hash', (req, res, next) => {
    User.findOne( { emailHash: `${req.params.hash}`}, 
        async (err, result) => {
            if(err) {
                console.error(err);
                res.status(500).json(err);
            }
            //console.log(result);
            result.emailVerified = true;
            result.emailHash = undefined;
            result.save();
            console.log('chenged to: ', result);
            let token;
            try {
                token = await createToken(result, res, next);
            } catch(e) {
                console.error(e);
                res.status(500).json(e);
            }
            res.status(200).json({
                'token': token
            });
        });
});

//get user from db, check if hashed body.password match hashPassowrd
//from db and the return token
router.post('/login', (req, res, next) => {
    User.findOne({ email: `${req.body.email}`}, 
        (err, result) => {
            if(err) {
                console.error(err);
                res.status(500).json(err);
            }
            bcrypt.compare(req.body.password, result.passwordHash, async (err, success) => {
                if(err) {
                    console.error(err);
                    res.status(500).json(err);
                }
                if(success) {
                    console.log('passwords match');
                    let token;
                    try {
                        token = await createToken(result, res, next);
                        console.log('token: ', token);
                    } catch (e) {
                        console.error(e);
                        res.status(500).json(err);
                    }
                    res.status(200).json({
                        'token': token
                    });
                } else {
                    console.log('passwords don`t match');
                    res.status(200).json({msg: 'passwords don`t match'});
                }
            });
        }
    );
});

//create token for authorization
let createToken = (user, res) => {
    return new Promise((resolve, reject) => {
        let token;
        User.findById(user.id, (err, result) => {
            if(err) {
                reject(err);
            }
            let expiry = new Date();
            expiry.setDate(expiry.getDate() + 7);
            token = jwt.sign({
                _id: result.id,
                email: result.email,
                exp: parseInt(expiry.getTime() / 1000),
            },
            'MY_SECRET');
            resolve(token);
        });
    });
}

module.exports = router;