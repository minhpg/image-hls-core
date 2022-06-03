const { fileSchema } = require('../../../bunnycdn-encoding/db')
const progressQueue = require('../../../bunnycdn-encoding/queues/progress')
const { sendMessage } = require('../../telegram-api/sendMessage')

module.exports = async (req, res) => {
    try {
        console.log(req.body)
        const { VideoLibraryId, VideoGuid, Status } = req.body
        const file = await fileSchema.findOne({ 'uploadedTo.videoId': VideoGuid, 'uploadedTo.libraryId': VideoLibraryId }).exec()
        if (file && Status == 3) {
            await sendMessage(`https://drive.google.com/file/d/${file.id} done encoding!\n https://video.bunnycdn.com/play/${VideoLibraryId}/${VideoGuid}`)
            const { id, uploadedTo } = file
            const { libraryId, videoId, libraryAccessKey, pullZone } = uploadedTo
            await progressQueue.add(id, {
                fileId: id,
                libraryId,
                videoId,
                pullZone,
                accessKey: libraryAccessKey
            })
        }
        res.json({
            status: 'success',
            message: 'file started',
        })
    }
    catch (err) {
        res.json({
            status: 'failed',
            message: err.message,
        })
    }
}