require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = 3001 || process.env.PORT;

module.exports = { MONGODB_URI, PORT };



