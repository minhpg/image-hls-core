const { Worker } = require('bullmq')

const path = require('path')

const fileSchema = require('../../models/file')
const videoSchema = require('../../models/video')


const serviceNames = require('../../serviceNames')

const uploadQueue = require('../../queues/upload')
const downloadQualities = require('./bunnycdn')

require('dotenv').config()
require('../../db')()
console.log(`Starting ${serviceNames.DOWNLOAD} worker`)


if (!process.env.DOWNLOAD_DEST) process.env.DOWNLOAD_DEST = 'downloads'

const worker = new Worker(serviceNames.DOWNLOAD, async job => {
    const files = []
    const { fileId, playlistUrl } = job.data
    const video = await videoSchema.findOne({ fileId }).exec()
    if (!video) throw new Error('video not found!')
    try {
        const qualities = await downloadQualities(playlistUrl, fileId, process.env.DOWNLOAD_DEST)
        for(const quality of qualities) {
            const file = new fileSchema({
                ...quality
            })
            await file.save()
            await uploadQueue.add(fileId, {
                fileId,
                playlistUrl,
                id: file._id
            })
        }
        await video.updateOne({
            files,
            downloaded: true
        }).exec()
    }
    catch (err) {
        await video.updateOne({
                error: true, error_message: err.message,
        }).exec()
        throw err
    }
    return
}, { concurrency: 1, connection: require('../../queueConnection') });

worker.on('completed', (job) => {
    console.log(`${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
    console.log(`${job.id} has failed with ${err.message}`);
});