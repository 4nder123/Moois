const jwt = require('jsonwebtoken');
const fs = require('fs')
const path = require('path');
require('dotenv').config();

const usersDB = () => {
    return { "users": JSON.parse(fs.readFileSync('./database/users.json'))}
}

const verifyJWT = (req, res, next) => {
    try{
        if(req.cookies.Token !== undefined){
            jwt.verify(req.cookies.Token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
                if (err) {
                    res.redirect("login")
                } else {
                    res.id = decoded.id
                    next()
                }
            })
        }
        else if (req.cookies.RToken !== undefined){
            jwt.verify(req.cookies.RToken, process.env.REFRESH_TOKEN_SECRET,function (err, decoded) {
                if(err){
                    res.redirect("login")
                } else {
                    const usersdb = usersDB()
                    const user = usersdb.users.find(person => person.token.includes(req.cookies.RToken))
                    if(user){
                        user.token = user.token.filter(function(item) {
                            return item !== req.cookies.RToken;
                        })
                        const rtoken = jwt.sign({"id": user.id, "date": Date.now()}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' })
                        const token = jwt.sign({"id": user.id}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20m' })
                        user.token.push(rtoken)
                        res.cookie('Token', token, { maxAge: 1200000, httpOnly: true })
                        res.cookie('RToken', rtoken, { maxAge: 2592000000, httpOnly: true })
                        fs.writeFileSync(path.join(__dirname, '../database/users.json'),JSON.stringify(usersdb.users, null, 4))
                        res.id = user.id
                        next()
                    }
                    else{
                        res.redirect("login")
                    }
                }

            })
        }
        else{
            res.redirect("login")
        }
    } catch(err) {
        console.log(err)
        res.redirect("login")
    }

}

function isloggedin(req, res, next){
    const user = usersDB().users.find(person => person.token.includes(req.cookies.RToken))
    if(user){
        res.redirect("/")
    }
    else{
        next()
    }
}

module.exports = {verifyJWT, isloggedin}