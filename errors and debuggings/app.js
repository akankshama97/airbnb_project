const http = require('http');
const testingSyntax = require('./syntax')
const testingRuntime = require('./runtime')
const testingLogical = require('./logical')


const server = http.createServer((req, res) => {
    console.log(req.url, req.method);
    //testingSyntax();
    //testingRuntime();
    testingLogical();
});
const PORT = 3002;
server.listen(PORT, () => {
  console.log(`Server running on address http://localhost:${PORT}`);
});