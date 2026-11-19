
const { createClient } = require('redis');

const redisClient = createClient({
    url: 'redis://127.0.0.1:6379'
});

redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
});

redisClient.on('connect', () => {
    console.log('Connecting to Memurai...');
});

redisClient.on('ready', () => {
    console.log('Memurai Redis connected successfully!');
});

module.exports = redisClient;
