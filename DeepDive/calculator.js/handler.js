const sumRequestHandler = (req, res) => {
  console.log("In Sum Request Handler", req.url);
  
  const body = [];

  // Data ke tukdo (chunks) ko accept karna
  req.on('data', (chunk) => {
    body.push(chunk);
  });

  // Jab pura data aa jaye
  req.on('end', () => {
    const bodyStr = Buffer.concat(body).toString(); // Data ko string mein badla
    const params = new URLSearchParams(bodyStr); // Data ko parse karne ke liye
    const bodyObj = Object.fromEntries(params); // Object banaya jaise { first: '5', second: '10' }

    // Number() use kiya taaki text math ke number mein badal jaye
    const result = Number(bodyObj.first) + Number(bodyObj.second);

    console.log("Result is:", result);

    // Browser par result dikhane ke liye HTML response
    res.setHeader('Content-Type', 'text/html');
    res.write('<html>');
    res.write('<head><title>Result</title></head>');
    res.write('<body>');
    res.write(`<h1>Your Sum is ${result}</h1>`);
    res.write('<a href="/calculator">Go Back to Calculator</a>');
    res.write('</body>');
    res.write('</html>');
    return res.end(); // Response complete
  });
};

// Is function ko export kar rahe hain taaki handler.js use kar sake
exports.sumRequestHandler = sumRequestHandler;