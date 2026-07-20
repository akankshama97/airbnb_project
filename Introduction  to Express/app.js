const http = require('http');
// Create an instance of the Express application
const express = require('express');
const reqestHandler = require('./user');
const app = express();
app.get("/", (req, res, next) => {
    console.log("Came in first middleware", req.url, req.method, req.headers);
    next();
});
app.post("/", (req, res, next) => {
    console.log("Came in another middleware", req.url, req.method, req.headers);
    res.send('<p>Came to the root URL!</p>');
    next();
});
// Define a route for the root URL
app.use('/submit-details', (req, res, next) => {
    console.log("Came in second middleware", req.url, req.method, req.headers);
  res.send('Hello, Express! <p>Welcome to the Express application.</p>');
  
});


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
