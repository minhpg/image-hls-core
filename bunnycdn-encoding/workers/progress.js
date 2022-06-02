const { Worker } = require('bullmq')

const serviceNames = require('../serviceNames')
const { fileSchema } = require('../db')

const hlsDownloadQueue = require('../../image-hls-upload/queues/download')

const BunnyVideo = require('../bunny-api/video')

// const fs = require('fs')
// const axios = require('axios')
// const extractPlaylistUrl = require('../bunny-api/extractPlaylistUrl')

require('dotenv').config()
require('../db/init')()
console.log(`Starting ${serviceNames.PROGRESS} worker`)


const worker = new Worker(serviceNames.PROGRESS, async job => {
    const { fileId,
        libraryId,
        videoId,
        accessKey, pullZone } = job.data
    console.log(job.data)
    const file = await fileSchema.findOne({ id: fileId }).exec()
    if (!file) throw new Error('file not found')
    try {
        const videoClient = new BunnyVideo(accessKey)
        const { encodeProgress, status } = await videoClient.getVideo(libraryId, videoId)
        const statusList = [
            'created', 'uploaded', 'processing', 'transcoding', 'finished', 'error', 'upload failed'
        ]
        const statusString = statusList[status]
        await file.updateOne({
           renderProgress: {
               progress: encodeProgress,
               status: statusString
           }
        }).exec()
        if(status!=4) throw new Error(statusString)
        const playlistUrl = `https://${pullZone}.b-cdn.net/${videoId}/playlist.m3u8`//await extractPlaylistUrl(libraryId, videoId)
        await hlsDownloadQueue.add(fileId, { fileId, accessKey, videoId, libraryId, playlistUrl, pullZone })
        await file.updateOne({
            renderProgress: {
                playlistUrl,
                proceedToDownload: true
            }
         }).exec()
    }
    catch (err) {
        await file.updateOne({
            renderProgress: {
                error: true, error_message: err.message
            }
        }).exec()
        throw err
    }
    return
}, { concurrency: 1, connection: require('../queueConnection') });

worker.on('completed', (job) => {
    console.log(`${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
    console.log(err)
    console.log(`${job.id} has failed with ${err.message}`);
});