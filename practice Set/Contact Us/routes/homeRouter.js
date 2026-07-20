//External Module
const express = require('express');
//Local Modules
const rootDir = require('../utils/pathUtil');

const homeRouter = express.Router();
homeRouter.get('/', (req, res) => {
    console.log("Handling / for GET", req.url, req.method, req.headers);
    res.sendFiles(Path.join(rootDir,"views","home.html"))
});

module.exports = homeRouter;