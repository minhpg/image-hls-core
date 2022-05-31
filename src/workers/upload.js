const { Worker } = require('bullmq')

const path = require('path')
const rimraf = require('rimraf')
const Bottleneck = require('bottleneck')

const fileSchema = require('../models/file')
const videoSchema = require('../models/video')


const serviceNames = require('../serviceNames')

const upload = require('../kapwing-api/upload')

require('dotenv').config()
require('../db')()
console.log(`Starting ${serviceNames.UPLOAD} worker`)


if (!process.env.DOWNLOAD_DEST) process.env.DOWNLOAD_DEST = 'downloads'

const worker = new Worker(serviceNames.UPLOAD, async job => {
    const { fileId, id } = job.data
    const video = await videoSchema.findOne({ fileId }).exec()
    if (!video) throw new Error('video not found!')
    const file = await fileSchema.findOne({ _id: id }).exec()
    if (!file) throw new Error('file not found!')
    console.log(`uploading ${fileId} - ${file.res}p`)
    try {
        const segments = file.segments
        const limiter = new Bottleneck({
            maxConcurrent: 100
        });
        for(const segment of segments) {
            const url = await limiter.schedule(() =>
            upload(segment.uri)
        )
            segment.uri = url
        }
        file.segments = segments
        file.uploaded = true
        const folder = path.join(process.env.DOWNLOAD_DEST, fileId, file.res.toString())
        rimraf.sync(folder)
        await file.save()
    }
    catch (err) {
        await file.updateOne({
                error: true, error_message: err.message,
        }).exec()
        throw err
    }
    return
}, { concurrency: 5, connection: require('../queueConnection') });

worker.on('completed', (job) => {
    console.log(`${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
    console.log(`${job.id} has failed with ${err.message}`);
});