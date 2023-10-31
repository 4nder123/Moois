const express = require('express')
const app = express()
const axios = require('axios')
const cors = require('cors')
const path = require('path');
const isctund = require("./js-modules/icsToJson_Tunniplaan.js")
const isctoo = require("./js-modules/icsToJson_Kodutoo.js")
const bcrypt = require('bcrypt');
const fsPromises = require('fs').promises;
const fs = require('fs')
const url = require('url')
const cookieParser = require("cookie-parser")
const {verifyJWT, isloggedin} = require('./middleware/jwt_verify.js')
const nodeCron = require("node-cron");
const bodyParser = require("body-parser");

const jwt = require('jsonwebtoken');
require('dotenv').config();

app.set('view engine','ejs'); 

app.engine('ejs', require('ejs').__express);

app.use(cors({
    orgin: '*'
}))

app.use(bodyParser.json({ extended: false }))

app.use(cookieParser())

app.use(express.urlencoded({extended: false}))

const usersDB = () => {
    return { "users": JSON.parse(fs.readFileSync('./database/users.json'))}
}

const job = nodeCron.schedule("0 0 0 * * *", () => {
    const userdb = usersDB();
    for(i=0; i < userdb.users.length; i++){
        for(j=0; j < userdb.users[i].token.length; j++){
            jwt.verify(userdb.users[i].token[j], process.env.REFRESH_TOKEN_SECRET, function (err, decoded) {
                if(err){
                    userdb.users[i].token = userdb.users[i].token.filter(function(item) {
                        return item !== userdb.users[i].token[j];
                    })
                }
            })
        }
    }
    fs.writeFileSync(path.join(__dirname, './database/users.json'),JSON.stringify(userdb.users, null, 4))
  });

const evjson = function(ev){
    for(var key in ev){
        for(var key2 in ev){
            if(key!=key2){
                if(ev[key].title.replace(/\w+[.!?]?$/, '')==ev[key2].title.replace(/\w+[.!?]?$/, '') && ev[key].start.slice(0,-7) == ev[key2].start.slice(0,-7)){
                    ev[key2].title = ev[key2].title.replace(/\w+[.!?]?$/, '')
                    ev[key2].start = ev[key].start
                    ev.splice(key, 1)
                }
            }
        }
    }
    return ev
}

app.post("/savedone", verifyJWT, function(req, res){
    fs.writeFileSync(path.join(__dirname, './database/user-saved-info/'+res.id+'.json'),JSON.stringify(req.body))
    return res.status(204).send()
})

const getdone = function(id){
    if (fs.existsSync('./database/user-saved-info/'+id+'.json')) {
        return fs.readFileSync('./database/user-saved-info/'+id+'.json')
    }
    else{
        return '[]'
    }
}

app.post('/register', async (req, res) => {
    const usersdb = usersDB()
    const user = req.body.email;
    if (!usersdb.users.find(person => person.user === user)){
        try {
            //encrypt the password
            const hashedPwd = await bcrypt.hash(req.body.password, 10);
            //store the new user
            const newUser = { "id": usersdb.users.length + 1 ,"user": user, "password": hashedPwd ,"moodle": "", "ois": "", "allow": 0, "token": [], "pohivaade": "tunniplaan"};
            usersdb.users.push(newUser)
            await fsPromises.writeFile(
                path.join(__dirname, '/database/users.json'),
                JSON.stringify(usersdb.users, null, 4)
            );
            res.redirect(url.format({
                pathname:"login",
                query: {
                   "message": "Kasutaja loodud!",
                   "email": req.body.email,
                   "type":"success"
                 }
              }))
        } catch (err) {
            res.render('register.ejs', {message: err.message});
        }
    }
    else{
        res.render('register.ejs', {message: "Kasutaja juba olemas!"});
    }
})

const isValidUrl = urlString=> {
    var urlPattern = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
  '(\\#[-a-z\\d_]*)?$','i'); // validate fragment locator
return !!urlPattern.test(urlString);
}

app.post('/settingssave', verifyJWT,function(req, res){
    const usersdb = usersDB()
    const user = usersdb.users.find(person => person.id === res.id)
    if(!isValidUrl(req.body.ois)){
        req.body.ois = ""
    }
    if(!isValidUrl(req.body.moodle)){
        req.body.moodle = ""
    }
    if(user.ois != req.body.ois | user.moodle != req.body.moodle | user.pohivaade != req.body.pohivaade){
        user.ois = req.body.ois
        user.moodle = req.body.moodle
        user.pohivaade = req.body.pohivaade
        fs.writeFileSync(path.join(__dirname, '/database/users.json'),JSON.stringify(usersdb.users, null, 4))
        return res.redirect("/")
    }
    res.redirect(new URL(req.headers.referer).pathname)
})

app.post('/login', async(req, res) =>{
    const usersdb = usersDB()
    const user = usersdb.users.find(person => person.user === req.body.email)
    if(!user){
        res.render('login.ejs', {message: "Email või parool on vale!", email: req.body.email, type: "error"});
    }
    else{
        if(await bcrypt.compare(req.body.password, user.password)){
            if(user.allow === 1){
                const token = jwt.sign({"id": user.id}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20m' })
                const rtoken = jwt.sign({"id": user.id, "date": Date.now()}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' })
                user.token.push(rtoken)
                res.cookie('Token', token, { maxAge: 1200000, httpOnly: true })
                res.cookie('RToken', rtoken, { maxAge: 2592000000, httpOnly: true })
                await fsPromises.writeFile(
                    path.join(__dirname, '/database/users.json'),
                    JSON.stringify(usersdb.users, null, 4)
                );
                res.redirect('/');
            }
            else{
                res.render('login.ejs', {message: "Ligipääs keelatud!", email: req.body.email, type: "error"});
            }
        }
        else{
            res.render('login.ejs', {message: "Email või parool on vale!", email: req.body.email, type: "error"});
        }
    }
})

app.post('/getevents', async(req,res) => {
    let url = req.body.calurl
    if(url!=""){
        url = new URL(url)
        axios.get(url.href).then(async function (response) {
            if(url.hostname == "moodle.ut.ee"){
                res.send(evjson(await isctoo(response.data.toString())))
            }
            else if(url.hostname == "ois2.ut.ee"){
                res.send(isctund(response.data.toString()))
            }
            else{
                return ""
            }
        }).catch(function (error) {
            res.send("")
        })
    }
    else{
        res.send("")
    }
})

app.get('/', verifyJWT, function(req,res){
    const user = usersDB().users.find(person => person.id === res.id)
    res.render('index.ejs', {id: res.id, moodle:user.moodle, ois:user.ois, pohivaade:user.pohivaade, evstatus: getdone(res.id)})
})

app.get('/register', isloggedin,function(req,res){
    res.render('register.ejs' , {message: ""});
})

app.get('/login', isloggedin,function(req,res){
    if(Object.keys(req.query).length === 0){
        res.render('login.ejs', {message: "", email: "", type: ""});
    }
    else{
        res.render('login.ejs', {message: req.query.message, email: req.query.email, type: req.query.type});
    }
})

app.get('/tunniplaan', verifyJWT, function(req,res){
    res.sendFile(path.join(__dirname + "/js-modules/tunniplaan.js"));
})

app.get('/kodutoo', verifyJWT, function(req,res){
    res.sendFile(path.join(__dirname + "/js-modules/kodutoo.js"));
})

app.get('/login.css', function(req, res) {
    res.sendFile(path.join(__dirname + "/views/login.css"));
  });

app.get('/style.css', function(req, res) {
    res.sendFile(path.join(__dirname + "/views/style.css"));
});

app.get('/Moois_website', function(req, res) {
    res.sendFile(path.join(__dirname + "/icon/Moois_website.png"));
});

app.get('/logout', function(req, res) {
    const usersdb = usersDB()
    try{
        const user = usersdb.users.find(person => person.token.includes(req.cookies.RToken))
        user.token = user.token.filter(function(item) {
            return item !== req.cookies.RToken;
        })
        fs.writeFileSync(path.join(__dirname, './database/users.json'),JSON.stringify(usersdb.users, null, 4))
    } catch (err) {

    }
    res.clearCookie("Token");
    res.clearCookie("RToken");
    res.redirect("/")
  });

app.listen(3000)