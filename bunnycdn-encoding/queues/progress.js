const { Queue, QueueScheduler } = require('bullmq')
const serviceNames = require('../serviceNames')
const queue = new Queue(serviceNames.PROGRESS,{
    connection: require('../queueConnection'),
    defaultJobOptions: {
        attempts: 100,
        backoff: {
            type: 'fixed',
            delay: 100000,
        },
    }
})
const queueScheduler = new QueueScheduler(serviceNames.PROGRESS);
module.exports = queue