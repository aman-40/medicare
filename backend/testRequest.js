const https = require('https');

const data = JSON.stringify({
  email: 'admin@visioncare.com',
  password: 'admin123',
  name: 'Admin User',
  role: 'ADMIN'
});

const options = {
  hostname: 'medicare-production-5b66.up.railway.app',
  port: 443,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  let body = '';
  res.on('data', d => { body += d; });
  res.on('end', () => { console.log('Response:', res.statusCode, body); });
});

req.on('error', error => { console.error(error); });
req.write(data);
req.end();
