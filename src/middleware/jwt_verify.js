const jwt = require('jsonwebtoken');

const verifyJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (token == null) return res.sendStatus(401);
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) return res.sendStatus(401);
            req.id = decoded.id;
            next();
        });
    } catch (err) {
        return res.sendStatus(401);
    }
};

const verifyJWTSocket = async (req, res, next) => {
    try {
        const isHandshake = req._query.sid === undefined;
        if (!isHandshake) return next();
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (token == null) return next(new Error("no token"));
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) return next(new Error("invalid token"));
            req.id = decoded.id;
            next();
        });
    } catch (err) {
        return next(new Error("Unkown error"));
    }
};

module.exports = {verifyJWT, verifyJWTSocket}