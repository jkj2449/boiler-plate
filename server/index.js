const express = require('express')
const app = express()
const port = 5000
const config = require('./config/key')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const { User } = require("./models/User")
const { auth } = require('./middleware/auth')

app.use(cookieParser())
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useCreateIndex: true, 
    useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err))


app.get('/', (req, res) => res.send('Hello World! 안녕하세요'))

app.post('/api/users/register', (req, res) => {
    const user = new User(req.body)
    user.save((err, doc) => {
        if(err) {
            console.log(err)
            return res.json({
                success: false,
                message: "등록에 실패했습니다."
            })
        }
        return res.status(200).json({
            success: true
        })
    })
})

app.post('/api/users/login', (req, res) => {
    User.findOne({ email: req.body.email}, (err, user) => {
        if(!user) {
            return res.json({
                loginSuccess: false,
                message: "해당 되는 유저정보가 없습니다."
            })
        }

        user.comparePassword(req.body.password, (err, isMatch) => {
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

app.get('/api/users/auth', auth, (req, res) => {
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        lastname: req.user.lastname
    })
})

app.get('/api/users/logout', auth, (req, res) => {
    User.findOneAndUpdate({
        _id: req.user._id
    }, {
        token: ""
    }, (err => {
        if(err) return res.json({
            success: false
        })

        return res.status(200).send({
            success: true
        })
    }))
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))