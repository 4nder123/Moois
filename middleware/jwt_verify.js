const jwt = require('jsonwebtoken');
const fs = require('fs')
const path = require('path');
require('dotenv').config();

const usersDB = () => {
    return { "users": JSON.parse(fs.readFileSync('./database/users.json'))}
}

const verifyJWT = async (req, res, next) => {
    try {
        const { Token, RToken } = req.cookies;
        const usersdb = usersDB();

        // Helper functions
        const generateTokens = (user) => {
            const token = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' });
            const rtoken = jwt.sign({ id: user.id, date: Date.now() }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
            user.token.push(rtoken);
            return { token, rtoken };
        };

        const setCookies = (token, rtoken) => {
            res.cookie('Token', token, { maxAge: 600000, secure:true, httpOnly: true }); // 20 minutes
            res.cookie('RToken', rtoken, { maxAge: 2592000000, secure:true, httpOnly: true }); // 30 days
        };

        if (Token) {
            try {
                const decoded = await jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET);
                req.id = decoded.id;
                return next();
            } catch (err) {}
        }
        
        if (RToken) {
            try {
                const decoded = await jwt.verify(RToken, process.env.REFRESH_TOKEN_SECRET);

                const user = usersdb.users.find(person => person.token.includes(RToken));
                if (!user) return next(new Error("User not found"));

                user.token = user.token.filter(item => item !== RToken);
                const { token, rtoken } = generateTokens(user);

                setCookies(token, rtoken);
                fs.writeFileSync(path.join(__dirname, '../database/users.json'), JSON.stringify(usersdb.users, null, 4));

                req.id = user.id;
                return next();
            } catch (err) {
                return next(new Error("invalid token"));
            }
        }
        return next(new Error("No tokens"));

    } catch (err) {
        return next(new Error("Unkown error"));
    }
};

module.exports = {verifyJWT}