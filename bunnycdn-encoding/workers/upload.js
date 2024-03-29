const { Worker } = require('bullmq')

const serviceNames = require('../serviceNames')
const { fileSchema } = require('../db')
const hlsVideoSchema = require('../../image-hls-upload/models/video')

const BunnyVideo = require('../bunny-api/video')
const BunnyLibrary = require('../bunny-api/library')

const uploadMP4 = require('../../image-hls-upload/kapwing-api/uploadMP4')

const fs = require('fs')
// const { sendMessage } = require('../../image-hls-upload/telegram-api/sendMessage')

// const progressQueue = require('../queues/progress')

require('dotenv').config()
require('../db/init')()
console.log(`Starting ${serviceNames.UPLOAD} worker`)


const worker = new Worker(serviceNames.UPLOAD, async job => {
    const { fileId, path } = job.data
    const file = await fileSchema.findOne({ id: fileId }).exec()
    if (!file) throw new Error('file not found')
    try {
        const accountList = require('../../accounts.json')
        const { apiKey, pullZone } = accountList[Math.floor(Math.random() * accountList.length)];
        const libraryClient = new BunnyLibrary(
            apiKey
        )
        const libraries = await libraryClient.listLibraries()
        const index = Math.floor(Math.random() * libraries.length);
        const { Id, ApiKey } = libraries[index]
        const videoClient = new BunnyVideo(ApiKey)
        const videoId = await videoClient.createAndUploadVideo(Id, path)
        const mp4Backup = await uploadMP4(path)
        await hlsVideoSchema.updateOne({ fileId }, {
            original: mp4Backup
        }).exec()
        await file.updateOne({
            uploadedTo: {
                uploaded: true,
                libraryId: Id,
                videoId,
                pullZone,
                libraryAccessKey: ApiKey
            }
        })
        await fs.promises.unlink(path)
        // await sendMessage(`https://drive.google.com/file/d/${file.id} - done upload to libraryId: ${Id} - videoId: ${videoId} \n`)
        // await progressQueue.add(fileId, {
        //     fileId, 
        //     libraryId: Id, 
        //     videoId, 
        //     accessKey: ApiKey
        // })
    }
    catch (err) {
        await file.updateOne({
            uploadedTo: {
                error: true, error_message: err.message
            }
        }).exec()
        await file.update({ $inc: { 'uploadedTo.retry': 1 } }).exec()
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