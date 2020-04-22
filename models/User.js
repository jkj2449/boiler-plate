const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const saltRounds = 10
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        maxlength: 100
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

userSchema.pre('save', function(next) {
    let user = this;
    
    //비밀번호 암호화
    if(!user.isModified('password')) {
        next()
        return
    }

    bcrypt.genSalt(saltRounds, (err, salt) => {
        if(err) return next(err)

        bcrypt.hash(user.password, salt, (err, hash) => {
            if(err) return next(err)
            user.password = hash
            next()
        });
    });
})

userSchema.methods.comparePassword = function (plainPassword, cb) {
    bcrypt.compare(plainPassword, this.password, (err, isMatch) => {
        if(err) return cb(err)
        cb(null, true)
    })
}

userSchema.methods.generateToken = function (cb) {
    let user = this;

    let token = jwt.sign(user._id.toHexString(), "secretToken")

    user.token = token;
    user.save((err, user) => {
        if(err) return cb(err)
        cb(null, user)
    })
}

userSchema.statics.findByToken = function(token, cb) {
    let user = this

    jwt.verify(token, 'secretToken', function(err, decoded) {
        user.findOne({
            "_id": decoded,
            "token": token 
        }, function(err, user) {
            if(err) return cb(err)
            cb(null, user)
        })
    })
}

const User = mongoose.model('User', userSchema)

module.exports = { User }