require('dotenv').config()

const redis = require("redis");
const client = redis.createClient({
    port: process.env.REDIS_PORT || 6379,
    host: process.env.REDIS_HOST || 'localhost',
    password: process.env.REDIS_PASSWORD || ''

});

client.on("error", function(error) {
  console.error(error);
});

module.exports = client
