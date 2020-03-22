const express = require('express')
const path = require('path')
const crypto = require('crypto')
let passport = require('passport')
let LocalStrategy = require('passport-local').Strategy
const router = express.Router()
let db = require('../db/db')

// 로그인 인증과정
passport.use(new LocalStrategy((username, password, done) => {
    let getpassquery = 'select * from accounts where name=?'
    db.query(getpassquery, username, function (err, data) {

        // 쿼리문에 오류가 있다면
        if (err) {
            return done(err)
        }

        // 데이터가 없다면 - 해당하는 닉네임이 없을떄
        if (!data[0]) {
            return done('<script type="text/javascript">alert("닉네임 또는 비밀번호가 틀렸습니다.");history.back();</script>')
        }

        let user = data[0]
        // 입력된 비밀번호 해시값
        let hashedpass = hex_sha256(password)
        // db에 저장된 비밀번호
        let realpass = user.password

        // 비밀번호가 틀리다면
        if (hashedpass != realpass) {
            return done('<script type="text/javascript">alert("닉네임 또는 비밀번호가 틀렸습니다.");history.back();</script>')
        }

        return done(null, user)
    })
}))

// 유저 객체에서 아이디값 반환
passport.serializeUser(function (user, done) {
    done(null, user.name)
})

passport.deserializeUser(function (name, done) {
    let getuserquery = 'select name from accounts where name=?'
    db.query(getuserquery, name, function (err, data) {
        if (data[0]) {
            return done(null, data[0])
        }
    })
})

router.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login',
}))

router.post('/register', function (req, res) {
    console.log(req.body)
    if (ishaveEmpty[req.body.nickname, req.body.password]) {
        res.status(401)
        res.send('<script type="text/javascript">alert("누락된 정보가 있습니다.");history.back();</script>')
        return
    }

    let bodynickname = req.body.nickname
    let bodypassword = req.body.password
    let hashedpass = hex_sha256(bodypassword)
    console.log(bodypassword + '\n' + hashedpass)

    let account = {
        name: bodynickname,
        password: hashedpass
    }
    let createaccountquery = 'insert into accounts set ?'
    db.query(createaccountquery, account, function (err, data) {
        if (err) {
            // 쿼리문에 오류가 있다면
            console.log(err)
            res.status(401)
            res.send('<script type="text/javascript">alert("중간과정에 오류가 있었습니다.");history.back();</script>')
        } else {
            res.send('<script type="text/javascript">alert("계정이 성공적으로 생성되었습니다.");location.href="/"</script>')
        }
    })
})

// get이지만 보여주는 화면이없어 백엔드로 분류
router.get('/logout', function (req, res) {
    if (req.session.isLogin == true) {
        // 만약 로그인됐다면 세션벙보 삭제
        req.session.destroy(function () {
            res.send('<script type="text/javascript">alert("성공적으로 로그아웃되었습니다");location.href="/"</script>')
            console.log('로그아웃', req.session)
        })
    } else {
        // 만약 로그인되지 않았다면 로그인 페이지로 이동
        res.redirect('/login')
    }
})

// 값없는 변수가 포함되있는지 확인하는 함수
function ishaveEmpty(array) {
    let flag = false
    array.forEach(function (element) {
        if (!Boolean(element)) {
            flag = true
            return
        }
    })
    return flag
}

function hex_sha256(str) {
    return crypto.createHash('sha256').update(str).digest('hex')
}
module.exports = router