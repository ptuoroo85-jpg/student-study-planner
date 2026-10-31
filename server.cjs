const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const files = { '/': ['index.html', 'text/html'], '/index.html': ['index.html', 'text/html'], '/styles.css': ['styles.css', 'text/css'], '/dashboard.css': ['dashboard.css', 'text/css'], '/app.js': ['app.js', 'text/javascript'] };
http.createServer((req, res) => {
  const file = files[new URL(req.url, 'http://localhost').pathname];
  if (!file) { res.writeHead(404); res.end('Not found'); return; }
  res.writeHead(200, { 'Content-Type': `${file[1]}; charset=utf-8`, 'Cache-Control': 'no-store' });
  fs.createReadStream(path.join(__dirname, 'dist', file[0])).pipe(res);
}).listen(4173, '127.0.0.1', () => console.log('Local: http://127.0.0.1:4173'));
