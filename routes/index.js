const express = require('express')
const path = require('path')
const router = express.Router()

// 로그인되지 않았다면 로그인페이지로 연결하는 라우터
var isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        next()
        return
    }
    res.redirect('/login')
}

router.get('/', isAuthenticated, function (req, res) {
    res.redirect('/profile')
})

router.get('/profile',isAuthenticated, function (req, res) {
    res.render('../views/myprofile', {
        nickname: req.session.passport.user
    })
})

router.get('/login',function (req, res) {
    res.sendFile(path.resolve('./views/loginpage.html'))
})

router.get('/register', function (req, res) {
    res.sendFile(path.resolve('./views/register.html'))
})

module.exports = router