const jwt = require('jsonwebtoken');
const fs = require('fs')
const path = require('path');
require('dotenv').config();

const usersDB = () => {
    return { "users": JSON.parse(fs.readFileSync('./database/users.json'))}
}

const verifyJWT = (req, res, next) => {
    try{
        jwt.verify(req.cookies.Token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
            if (err) {
                const usersdb = usersDB()
                const user = usersdb.users.find(function(person){
                    for(i=0 ; i < person.token.length; i++){
                        if(person.token[i] === req.cookies.RToken){
                            return person
                        }
                    }
                })
                if(user){
                    const token = jwt.sign({"id": user.id}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10s' })
                    user.token = user.token.filter(function(item) {
                        return item !== req.cookies.RToken;
                    })
                    const rtoken = jwt.sign({"id": user.id, "date": Date.now()}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' })
                    user.token.push(rtoken)
                    res.cookie('Token', token, { maxAge: 10000, httpOnly: true })
                    res.cookie('RToken', rtoken, { maxAge: 2592000000, httpOnly: true })
                    fs.writeFileSync(path.join(__dirname, '../database/users.json'),JSON.stringify(usersdb.users))
                    res.id = user.id
                    next()
                }
                else{
                    res.redirect("login")
                }
            } else {
                res.id = decoded.id
                next()
            }
        })
    } catch(err) {
        console.log(err)
        res.redirect("login")
    }

}

module.exports = verifyJWT