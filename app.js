const express = require('express')
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
const {verifyJWT} = require('./middleware/jwt_verify.js')
const nodeCron = require("node-cron");
const bodyParser = require("body-parser");
const socketIo = require("socket.io");
const http = require('http');

const app = express()
const server = http.createServer(app);
const io = socketIo(server);

const jwt = require('jsonwebtoken');
require('dotenv').config();

app.set('view engine','ejs'); 

app.engine('ejs', require('ejs').__express);

app.use(cors())

app.use(bodyParser.json({ extended: false }))

app.use(cookieParser())

app.use(express.urlencoded({extended: false}))

const usersDB = () => {
    return { "users": JSON.parse(fs.readFileSync('./database/users.json'))}
}

io.engine.use(cookieParser());
io.engine.use(verifyJWT);
io.on('connection', (socket) => {
    socket.on('liveUpdate', () => {
      socket.join(socket.request.id);
    });  
});

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


  app.post("/savedone", verifyJWT, function (req, res) {
    const filePath = path.join(__dirname, `./database/user-saved-info/${req.id}.json`);

    const readFileData = () => {
        if (fs.existsSync(filePath)) {
            try {
                return JSON.parse(fs.readFileSync(filePath));
            } catch (error) {
                return { done: [], highlight: [] };
            }
        }
        return { done: [], highlight: [] };
    };

    const writeFileData = (data) => {
        try {
            fs.writeFileSync(filePath, JSON.stringify(data));
        } catch (error) {
            return res.status(500).send("Error saving data");
        }
    };

    const info = readFileData();
    const { action, info: reqInfo } = req.body;
    switch (action) {
        case "ev-save":
            if (!info.done.includes(reqInfo)) {
                if(info.highlight.some(high => high[0] === reqInfo)){
                    info.highlight = info.highlight.filter(high => high[0] !== reqInfo);
                }
                info.done.push(reqInfo);
            }
            break;
        case "ev-remove":
            info.done = info.done.filter(done => done !== reqInfo);
            break;
        case "high-save":
            info.highlight = info.highlight.filter(high => high[0] !== reqInfo[0]);
            info.highlight.push(reqInfo);
            break;
        case "high-remove":
            info.highlight = info.highlight.filter(high => high[0] !== reqInfo);
            break;
        default:
            return res.status(400).send("Invalid action");
    }

    writeFileData(info);
    io.to(req.id).emit('updateUserData', reqInfo, action);
    return res.status(204).send();
}, (err, req, res, next) => {
    res.status(500)
});

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
    const user = usersdb.users.find(person => person.id === req.id)
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
}, (err, req, res, next) => {
    res.status(500);
});

app.post('/login', async(req, res) =>{
    const usersdb = usersDB()
    const user = usersdb.users.find(person => person.user === req.body.email)
    if(!user){
        res.render('login.ejs', {message: "Email või parool on vale!", email: req.body.email, type: "error"});
    }
    else{
        if(await bcrypt.compare(req.body.password, user.password)){
            if(user.allow === 1){
                const token = jwt.sign({"id": user.id}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' })
                const rtoken = jwt.sign({"id": user.id, "date": Date.now()}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' })
                user.token.push(rtoken)
                res.cookie('Token', token, { maxAge: 600000, secure:true, httpOnly: true })
                res.cookie('RToken', rtoken, { maxAge: 2592000000, secure:true, httpOnly: true })
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

app.get('/getevents', verifyJWT, async(req,res) => {
    let url = req.query.calurl
    if(url!=""){
        url = new URL(url)
        axios.get(url.href).then(async function (response) {
            if(url.hostname.includes("moodle")){
                res.send(JSON.stringify(await isctoo(response.data.toString(), req.id)))
            }
            else if(url.hostname == "ois2.ut.ee"){
                res.send(isctund(response.data.toString()))
            }
            else{
                return res.send(500)
            }
        }).catch(function (error) {
            res.send(500)
        })
    }
    else{
        res.send(500)
    }
}, (err, req, res, next) => {
    res.send(500)
});

app.get('/', verifyJWT, function(req,res){
    const user = usersDB().users.find(person => person.id === req.id)
    res.render('index.ejs', {id: req.id, moodle:user.moodle, ois:user.ois, pohivaade:user.pohivaade})
}, (err, req, res, next) => {
    res.redirect("login");
});

app.get('/register', verifyJWT,function(req,res){
    res.redirect("/");
}, (err, req, res, next) => {
    res.render('register.ejs' , {message: ""});
});

app.get('/login', verifyJWT,function(req,res){
    res.redirect("/");
}, (err, req, res, next) => {
    if(Object.keys(req.query).length === 0){
        res.render('login.ejs', {message: "", email: "", type: ""});
    } else {
        res.render('login.ejs', {message: req.query.message, email: req.query.email, type: req.query.type});
    }
});

app.get('/tunniplaan', verifyJWT, function(req,res){
    res.sendFile(path.join(__dirname + "/js-modules/tunniplaan.js"));
}, (err, req, res, next) => {
    res.send(500)
});

app.get('/kodutoo', verifyJWT, function(req,res){
    res.sendFile(path.join(__dirname + "/js-modules/kodutoo.js"));
}, (err, req, res, next) => {
    res.send(500)
});

app.get('/long-press-event', verifyJWT, function(req,res){
    res.sendFile(path.join(__dirname + "/js-modules/long-press-event.min.js"));
}, (err, req, res, next) => {
    res.send(500)
});

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

server.listen(3000)