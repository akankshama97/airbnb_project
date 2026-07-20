// sum.js file se sumRequestHandler ko import kar rahe hain
const { sumRequestHandler } = require('./sum');

const requestHandler = (req, res) => {
  const url = req.url;
  const method = req.method;

  // 1. HOME PAGE ROUTE
  if (url === '/') {
    res.setHeader('Content-Type', 'text/html');
    res.write('<html>');
    res.write('<head><title>Home - Calculator</title></head>');
    res.write('<body>');
    res.write('<h1>Welcome to Calculator App</h1>');
    res.write('<a href="/calculator">Go To Calculator</a>');
    res.write('</body>');
    res.write('</html>');
    return res.end(); // Response yahan khatam hota hai
  }

  // 2. CALCULATOR FORM ROUTE
  if (url === '/calculator') {
    res.setHeader('Content-Type', 'text/html');
    res.write('<html>');
    res.write('<head><title>Practice Set</title></head>');
    res.write('<body>');
    res.write('<h1>Here is the Calculator</h1>');
    // method="POST" lagana zaroori hai data secure bhejne ke liye
    res.write('<form action="/calculate-result" method="POST">');
    res.write('<input type="number" name="first" placeholder="First Number" required> <br><br>');
    res.write('<input type="number" name="second" placeholder="Second Number" required> <br><br>');
    res.write('<button type="submit">Sum</button>');
    res.write('</form>');
    res.write('</body>');
    res.write('</html>');
    return res.end();
  }

  // 3. RESULT ROUTE (Form submit hone par yeh chalega)
  if (url === '/calculate-result' && method === 'POST') {
    return sumRequestHandler(req, res);
  }

  // 4. 404 NOT FOUND ROUTE (Agar koi galat URL daale)
  res.setHeader('Content-Type', 'text/html');
  res.write('<html><body><h1>404 Page Does Not Exist</h1><a href="/">Go To Home</a></body></html>');
  return res.end();
};

// Is function ko export kar rahe hain taaki app3.js use kar sake
exports.requestHandler = requestHandler;