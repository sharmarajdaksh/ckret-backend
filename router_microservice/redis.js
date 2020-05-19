const redis = require('redis');

const REDIS_URL = process.env.REDIS_URL;

const client = redis.createClient({
	host: REDIS_URL,
	port: 6379,
});

module.exports = client;