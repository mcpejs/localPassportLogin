const express = require('express');
const session = require('express-session');
let passport = require('passport')
const app = express()

app.use(session({
    secret: 'key~~~!hello~',
    resave: false,
    saveUninitialized: true,
}))

// public 폴더를 /public으로 접근시킴
app.use('/public', express.static('public'))

// post body 사용
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}))

// ejs 사용
app.set('view engine', 'ejs');
app.set('views', 'views');

// passport 사용설정하기
app.use(passport.initialize());
app.use(passport.session());

// 백엔드 api 라우터
let apiRouter = require('./routes/api')
app.use('/api', apiRouter)

// 프론트엔드 페이지 라우터
let indexRouter = require('./routes/index')
app.use('/', indexRouter)

app.listen(3000)
