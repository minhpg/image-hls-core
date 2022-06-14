const { Worker } = require('bullmq')

const path = require('path')
const {sendMessage} = require('../telegram-api/sendMessage')
const rimraf = require('rimraf')
const Bottleneck = require('bottleneck')

const fileSchema = require('../models/file')
const videoSchema = require('../models/video')


const serviceNames = require('../serviceNames')

const upload = require('../later-api/upload')

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
        const token = 'KKyzndJWbyrYissVGdfv13WxYU-3gzHK'
        const email = 'minhpg48@gmail.com'
        const groupId = '6967916'
        const segments = file.segments
        const limiter = new Bottleneck({
            minTime: 100
        });
        for (const segment of segments) {
            const url = await limiter.schedule(() =>
                upload(segment.uri, groupId, token, email)
            )
            segment.uri = url
        }
        const folder = path.join(process.env.DOWNLOAD_DEST, fileId, file.res.toString())
        rimraf.sync(folder)
        await file.updateOne({
            segments, uploaded: true, error: false, error_message: null,
        }).exec()
        // await sendMessage(`https://drive.google.com/file/d/${file.id} - ${file.res}p done upload\n`)
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