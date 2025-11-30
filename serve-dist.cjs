const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, 'dist');
const port = process.env.PORT || 5173;

const mime = {
  html: 'text/html',
  js: 'application/javascript',
  css: 'text/css',
  ico: 'image/x-icon',
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  json: 'application/json'
};

const server = http.createServer((req, res) => {
  try {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p === '/' || p === '') p = '/index.html';
    const safe = path.normalize(p).replace(/^\.\./, '');
    const file = path.join(root, safe);
    fs.stat(file, (err, stats) => {
      if (err || !stats.isFile()) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Not Found');
        return;
      }
      const ext = path.extname(file).slice(1);
      res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
      const stream = fs.createReadStream(file);
      stream.pipe(res);
      stream.on('error', () => {
        res.statusCode = 500;
        res.end('Server error');
      });
    });
  } catch (e) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Server error');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Static server running on http://localhost:${port}/`);
});

process.on('uncaughtException', (e) => {
  console.error('Uncaught', e);
});
process.on('unhandledRejection', (e) => {
  console.error('Rejection', e);
});
