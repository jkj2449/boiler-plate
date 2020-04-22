const express = require('express')
const app = express()
const port = 5000
const config = require('./config/key')

const cookieParser = require('cookie-parser')
app.use(cookieParser())

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err))

const { User } = require("./models/User")

app.get('/', (req, res) => res.send('Hello World! 안녕하세요'))

app.post('/register', (req, res) => {


    const user = new User(req.body)
    user.save((err, doc) => {
        if(err) return res.json({success: false, err})
        return res.status(200).json({
            success: true
        })
    })
})

app.post('/login', (req, res) => {
    User.findOne({ email: req.body.email}, (err, user) => {
        if(!user) {
            return res.json({
                loginSuccess: false,
                message: "해당 되는 유저정보가 없습니다."
            })
        }

        user.comparePssword(req.body.password, (err, isMatch) => {
            if(!isMatch) {
                return res.json({
                    loginSuccess: false,
                    message: "비밀번호가 일치하지 않습니다."
                })
            }

            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err)

                res.cookie("x_auth", user.token)
                .status(200)
                .json({
                    loginSuccess: true,
                    userId: user._id
                })
            })
        })
    })
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))