const mongooes = require('mongooes');

const userSchema = mongooes.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: ture,
        unique: 1
    },
    password: {
        type: String,
        minlength: 50
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

const User = mongooes.model('User', userSchema)

module.exports = { User }