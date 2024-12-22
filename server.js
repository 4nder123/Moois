const express = require('express');
const cookieParser = require('cookie-parser');
const compression = require('compression')
const routes = require('./src/routes');
require('dotenv').config();
const cors = require('cors');
const io = require('./src/controllers/socket');
const server = express();
const httpServer = io.setup(server);

server.use(cors({ origin: true, credentials: true }));
server.use(compression())
server.use(cookieParser());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Routes
server.use('/api', routes);

// Serve static files
server.use(express.static('public'));
const PORT = process.env.PORT || 3000;

// Start server
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
