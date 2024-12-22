const { Server } = require("socket.io");
const { createServer } = require("node:http");
const { verifyJWTSocket } = require("../middleware/jwt_verify");

const io = new Server({cors: {origin: "http://localhost:8080"}});

const setup = (app) => {
    const httpServer = createServer(app);
    io.attach(httpServer);
    io.engine.use(verifyJWTSocket);
    return httpServer;
}

io.on("connection", (socket) => {
    const userId = socket.request.id;
    socket.join(`user:${userId}`);
});

module.exports = {setup, io};
