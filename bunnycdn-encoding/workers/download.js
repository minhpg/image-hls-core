const { Worker } = require('bullmq')
const path = require('path')
const fs = require('fs')

const serviceAccountAuth = require('../google-drive-api/serviceAccountAuth')
const downloadVideo = require('../google-drive-api/download')

const { fileSchema } = require('../db')

const { sendMessage } = require('../../image-hls-upload/telegram-api/sendMessage')

const serviceNames = require('../serviceNames')

const uploadQueue = require('../queues/upload')

require('dotenv').config()
require('../db/init')()
console.log(`Starting ${serviceNames.DOWNLOAD} worker`)


if (!process.env.DOWNLOAD_DEST) process.env.DOWNLOAD_DEST = 'downloads'

const worker = new Worker(serviceNames.DOWNLOAD, async job => {
    const fileId = job.data.fileId
    const file = await fileSchema.findOne({ id: fileId }).exec()
    if (!file) throw new Error('file not found')
    if (!fs.existsSync(process.env.DOWNLOAD_DEST)) await fs.promises.mkdir(process.env.DOWNLOAD_DEST)
    try {
        const drive = await serviceAccountAuth()
        const video_path = path.join(process.env.DOWNLOAD_DEST, fileId + '.mp4')
        if(!fs.existsSync(video_path)) await downloadVideo(drive, fileId, video_path)
        console.log(video_path)
        await file.updateOne({
            downloadedTo: {
                downloaded: true,
                path: video_path
            }
        }).exec()
        await uploadQueue.add(fileId, {
            fileId, 
            path: video_path, 
        })
        // await sendMessage(`https://drive.google.com/file/d/${file.id} - done download\n`)
    }
    catch (err) {
        await file.updateOne({
            downloadedTo: {
                error: true, error_message: err.message,
            }
        }).exec()
        await file.updateOne({ $inc: { 'downloadedTo.retry': 1 } }).exec()
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