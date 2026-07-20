const http = require('http');
const server = http.createServer((req, res) => {
 console.log(req.url, req.method);
 if (req.url === '/home') {
    res.write('<h1>Welcome to home</h1>');
    return res.end();
 } else if (req.url === '/men') {
    res.write('<h1>Welcome to Men</h1>');
    return res.end();
 } else if (req.url === '/women') {
    res.write('<h1>Welcome to Women</h1>');
    return res.end();
 } else if (req.url === '/kids') {
    res.write('<h1>Welcome to Kids</h1>');
    return res.end();
 } else if (req.url === '/cart') {
    res.write('<h1>Welcome to Cart</h1>');
    return res.end();
 }
 res.setHeader('Content-type', 'text/html');
 res.write(`
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Myntra Navigation</title>
    <style>
        body {font-family: Arial, sans-serif; margin: 0; padding:0;}
        .navbar {background-color: aquamarine; padding: 15px; display:flex; gap:30px;}
        .navbar a { color : white; text-decoration:none; font-weight: bold; font-size: 16px;}
        .content { padding: 40px; text-align: center;}
        h1 { color :beige;}
    </style> 
</head>
<body>
    <div class="navbar">
       <a href="/home">Home</a>
       <a href="/men">Men</a>
       <a href="/women">Women</a>
       <a href="/kids">Kids</a>
       <a href="/cart">Cart</a>
    </div>
    <div class="content">
        <h1>Welcome to currentPage <Section></Section></h1>
    </div>
</body>
</html>
 `)
 res.end();
});
server.listen(3001, () => {
    console.log('Server running on address http://localhost:3001');
});
