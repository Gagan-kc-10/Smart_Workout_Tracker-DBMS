
const redisClient = require('./config/redis');

async function testRedis() {
    try {
        await redisClient.connect();

        await redisClient.set(
            'project_name',
            'Smart Workout Tracker'
        );

        const result = await redisClient.get('project_name');

        console.log('Redis stored value:', result);

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        if (redisClient.isOpen) {
            await redisClient.quit();
        }
    }
}

testRedis();
