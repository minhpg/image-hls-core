const { Worker } = require('bullmq')


const { fileSchema: bunnyFileSchema } = require('../db')
const videoSchema = require('../../image-hls-upload/models/video')
const fileSchema = require('../../image-hls-upload/models/file')

const serviceNames = require('../serviceNames')


require('dotenv').config()
require('../db/init')()
console.log(`Starting ${serviceNames.CLEAR} worker`)

const { Queue, QueueScheduler } = require('bullmq')
const BunnyVideo = require('../bunny-api/video')
const queue = new Queue(serviceNames.CLEAR,{
    connection: require('../queueConnection'),
})
const queueScheduler = new QueueScheduler(serviceNames.CLEAR);
queue.add(
    'clear',
    { },
    {
      repeat: {
        every: 1000*60*60*6,
      },
    },
  );

const worker = new Worker(serviceNames.CLEAR, async job => {
    const bunnyFiles = await bunnyFileSchema.find({ 'renderProgress.proceedToDownload': true}, {id: true}).exec()
    const files = []
    for(const bunnyFile of bunnyFiles) {
        const  { id } = bunnyFile
        const video = await videoSchema.findOne({ fileId: id}).exec()
        console.log(video)
        if(video) {
            for (const { _id } of video.files) {
                const file = await fileSchema.findOne({ _id, uploaded: true }, { uploaded: true }).exec()
                if (file) files.push(file)
            }
            if (files.length == video.files.length) {
                const {libraryAccessKey, videoId, libraryId } = bunnyFile.uploadedTo
                await bunnyFile.deleteOne()
                const bunnyClient = new BunnyVideo(libraryAccessKey)
                await bunnyClient.deleteVideo(libraryId, videoId)
                await video.updateOne({
                    uploaded: true
                })
            }
        }
    }

}, { concurrency: 1, connection: require('../queueConnection') });

worker.on('completed', (job) => {
    console.log(`${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
    console.log(`${job.id} has failed with ${err.message}`);
});