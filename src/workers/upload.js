const { Worker } = require('bullmq')

const path = require('path')

const fileSchema = require('../models/file')
const videoSchema = require('../models/video')


const serviceNames = require('../serviceNames')

const upload = require('../kapwing-api/upload')

require('dotenv').config()
require('../db')()
console.log(`Starting ${serviceNames.UPLOAD} worker`)


if (!process.env.DOWNLOAD_DEST) process.env.DOWNLOAD_DEST = 'downloads'

const worker = new Worker(serviceNames.UPLOAD, async job => {
    const files = []
    const { fileId, playlistUrl } = job.data
    const video = await videoSchema.findOne({ fileId }).exec()
    if (!video) throw new Error('video not found!')
    try {
        const qualities = video.files
        for(const quality of qualities) {
            const file = await fileSchema.findOne(quality).exec()
            const segments = quality.segments
            for(const segment of segments) {
                const url = await upload(segment.uri)
                segment.uri = url
            }
            file.segments = segments
            await file.save()
            files.push(file)
        }
        await video.updateOne({
            files,
            uploaded: true
        }).exec()
        await uploadQueue.add(fileId, {
            fileId,
            playlistUrl,
        })
    }
    catch (err) {
        await video.updateOne({
                error: true, error_message: err.message,
        }).exec()
        throw err
    }
    return
}, { concurrency: 1, connection: require('../queueConnection') });

worker.on('completed', (job) => {
    console.log(`${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
    console.log(`${job.id} has failed with ${err.message}`);
});