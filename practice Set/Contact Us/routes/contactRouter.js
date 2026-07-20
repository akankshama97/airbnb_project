//External Module
const express = require('express');
//Local Module
const rootDir = require('../utils/pathUtil');

const contactRouter = express.Router();

contactRouter.get('/contact-us', (req, res) => {
console.log("Handling /contact-us for GET", req.url, req.method, req.headers);
    res.sendFile(Path.join(rootDir, "views", "contact-us.html"))

});
contactRouter.post('/contact-us', (req, res) => {
    
    console.log(req.body);
    res.sendFile(path.join(rootDir, "views", contact-success.html));
    
  })

module.exports = contactRouter;