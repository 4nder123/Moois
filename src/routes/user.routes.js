const express = require('express');
const jwt = require('jsonwebtoken');
const { findUserByEmail, saveUserInfo, findUserById, findUserByToken, createUser } = require('../controllers/database')
const bcrypt = require('bcrypt');
const { io } = require('../controllers/socket');
const { verifyJWT } = require('../middleware/jwt_verify');
const router = express.Router();

router.get("/", verifyJWT ,(req, res) => {
    const user = findUserById(req.id);
    if(!user) return res.sendStatus(404);
    return res.send({ "ois": user.ois , "moodle": user.moodle});
});

router.put("/ois", verifyJWT ,(req, res) => {
    const user = findUserById(req.id);
    if(!user) return res.sendStatus(404);
    user.ois = req.body.url;
    io.to(`user:${req.id}`).emit("updateOis", req.body.url);
    saveUserInfo(user);
});

router.put("/moodle", verifyJWT ,(req, res) => {
    const user = findUserById(req.id);
    if(!user) return res.sendStatus(404);
    user.moodle = req.body.url;
    io.to(`user:${req.id}`).emit("updateMoodle", req.body.url);
    saveUserInfo(user);
});

router.post("/login", async (req, res) => {
    const user = findUserByEmail(req.body.email);
    if(!user) return res.sendStatus(404);
    if(await bcrypt.compare(req.body.password, user.password)){
        if(user.allow === 1){
            const token = jwt.sign({"id": user.id}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' });
            const rtoken = jwt.sign({"id": user.id, "date": Date.now()}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
            user.token.push(rtoken);
            saveUserInfo(user);
            res.cookie('RToken', rtoken, { maxAge: 2592000000, secure:true, sameSite: 'strict', httpOnly: true });
            
            return res.send({ "token": token });
        }
        return res.sendStatus(403);
    }
    return res.sendStatus(404);
});

router.post("/logout", (req, res) => {
    const user = findUserByToken(req.cookies.RToken);
    if (user) {
        user.token = user.token.filter(token => token !== req.cookies.RToken);
        saveUserInfo(user);
    }
    res.clearCookie("RToken");
    res.sendStatus(200);
});

router.post("/register", async (req, res) => {
    const user = req.body.email;
    if (!findUserByEmail(user)){
        try {
            const hashedPwd = await bcrypt.hash(req.body.password, 10);
            createUser(user, hashedPwd);
            res.sendStatus(200);
        } catch (err) {
            res.sendStatus(500);
        }
    }
    else{
        res.sendStatus(409);
    }
});

router.post("/refresh", (req, res) => {
    try {
        const refreshToken = req.cookies?.RToken;
        if (!refreshToken) return res.sendStatus(403);
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if (err) return res.sendStatus(403);
            const user = findUserById(decoded.id);
            if (!user) return res.status(404);
            if (!user.token.includes(refreshToken)) return res.sendStatus(403);
            const newRefreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
            const newAccessToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' });
            user.token = user.token.filter(token => token !== refreshToken);
            user.token.push(newRefreshToken);
            saveUserInfo(user);
            res.cookie('RToken', newRefreshToken, { maxAge: 2592000000, secure:true, sameSite: 'strict', httpOnly: true });
            return res.send({ "token": newAccessToken });
        });
    } catch (err) {
        return res.sendStatus(403);
    }
});

module.exports = router;