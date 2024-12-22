const express = require('express');
const axios = require('axios');
const { io } = require('../controllers/socket');
const icsHomeworkConverter = require('../controllers/icsHomeworkConverter');
const icsScheduleConverter = require('../controllers/icsScheduleConverter');
const { getUserEventData, updateUserEventData } = require('../controllers/database');
const router = express.Router();

router.get('/schedule/:url', (req, res) => {
    const url = new URL(req.params.url);
    if(!url.hostname.includes("ois2") && !url.hostname.includes("tahvel")) return res.status(400).send("Invalid URL");
    axios.get(url.toString()).then(response => res.send(JSON.stringify(icsScheduleConverter(response.data.toString()))))
        .catch(error => res.status(500).send(error));
});

router.get('/homework/:url', (req, res) => {
    const url = new URL(req.params.url);
    if(!url.hostname.includes("moodle")) return res.status(400).send("Invalid URL");
    const user_id = req.id;
    axios.get(url.toString()).then(response => icsHomeworkConverter(response.data.toString(), user_id).then(data => res.send(JSON.stringify(data))))
        .catch(error => res.status(500).send(error));
});

router.get('/homework', (req, res) => {
    icsHomeworkConverter('', req.id).then(data => res.send(JSON.stringify(data)));
});

router.post('/homework/done/:id', (req, res) => {
    try {
        const id = req.params.id;
        const {done, highlight, events} = JSON.parse(getUserEventData(req.id));
        done.push(id);
        updateUserEventData(req.id, done, highlight.filter(high => high[0] !== id), events);
        io.to(`user:${req.id}`).emit("addDone", id);
        res.sendStatus(200);
    } catch (err) {
        res.sendStatus(500);
    }
});

router.post('/homework/highlight/:id/:color', (req, res) => {
    try {
        const id = req.params.id;
        const color = req.params.color;
        const {done, highlight, events} = JSON.parse(getUserEventData(req.id));
        highlight.push([id, color]);
        updateUserEventData(req.id, done, highlight, events);
        io.to(`user:${req.id}`).emit("addHighlight", { id, color });
        res.sendStatus(200);
    } catch {
        res.sendStatus(500);
    }
});

router.post('/homework', (req, res) => {
    try {
        const event = req.body;
        const {done, highlight, events} = JSON.parse(getUserEventData(req.id));
        events.push(event);
        updateUserEventData(req.id, done, highlight, events);
        io.to(`user:${req.id}`).emit("addEvent", event);
        res.sendStatus(200);
    } catch {
        res.sendStatus(500);
    }
});

router.delete('/homework/:id', (req, res) => {
    try {
        const id = req.params.id;
        const {done, highlight, events} = JSON.parse(getUserEventData(req.id));
        updateUserEventData(req.id, done, highlight, events.filter(event => event.id !== id));
        io.to(`user:${req.id}`).emit("deleteEvent", id);
        res.sendStatus(200);
    } catch {
        res.sendStatus(500);
    }
});

router.delete('/homework/highlight/:id', (req, res) => {
    try {
        const id = req.params.id;
        const {done, highlight, events} = JSON.parse(getUserEventData(req.id));
        updateUserEventData(req.id, done, highlight.filter(high => high[0] !== id), events);
        io.to(`user:${req.id}`).emit("removeHighlight", id);
        res.sendStatus(200);
    } catch {
        res.sendStatus(500);
    }
});

router.delete('/homework/done/:id', (req, res) => {
    try {
        const id = req.params.id;
        const {done, highlight, events} = JSON.parse(getUserEventData(req.id));
        updateUserEventData(req.id, done.filter(done => done !== id), highlight, events);
        io.to(`user:${req.id}`).emit("removeDone", id);
        res.sendStatus(200);
    } catch {
        res.sendStatus(500);
    }
});

module.exports = router;