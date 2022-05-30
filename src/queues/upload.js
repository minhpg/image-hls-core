const { Queue, QueueScheduler } = require('bullmq')
const serviceNames = require('../serviceNames')
const queue = new Queue(serviceNames.UPLOAD,{
    connection: require('../queueConnection'),
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
    }
})
const queueScheduler = new QueueScheduler(serviceNames.UPLOAD);

module.exports = queue