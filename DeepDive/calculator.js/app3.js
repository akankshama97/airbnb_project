const http = require('http');
// handler.js file se requestHandler function ko import kar rahe hain
const { requestHandler } = require('./handler'); 

const PORT = 3000;

const server = http.createServer(requestHandler);

server.listen(PORT, () => {
  console.log(`Server running on address http://localhost:${PORT}`);
});