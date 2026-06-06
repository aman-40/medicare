const bcrypt = require('bcrypt');
const hash = '$2b$10$ZEQJ4ZLpp33pY5uZCkJ6DuWTpHuNu9INd3uX5yf9UuW/cWxs/Jxua';
bcrypt.compare('admin123', hash).then(console.log);
