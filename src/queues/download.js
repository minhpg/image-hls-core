const { Queue, QueueScheduler } = require('bullmq')
const serviceNames = require('../serviceNames')
const queue = new Queue(serviceNames.DOWNLOAD,{
    connection: require('../redisConnection'),
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
    }
})
const queueScheduler = new QueueScheduler(serviceNames.DOWNLOAD);

module.exports = queue