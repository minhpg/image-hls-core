const { fileSchema } = require('../../../bunnycdn-encoding/db')
const progressQueue = require('../../../bunnycdn-encoding/queues/progress')
module.exports = async (req, res) => {
    try {
        console.log(req.body)
        const { VideoLibraryId, VideoGuid } = req.body
        const file = await fileSchema.findOne({ 'uploadedTo.videoId': VideoGuid, 'uploadedTo.libraryId': VideoLibraryId }).exec()
        console.log(file)
        if (file) {
            const { fileId, uploadedTo } = file
            const { libraryId, videoId, libraryAccessKey } = uploadedTo
            await progressQueue.add(file.fileId, {
                fileId,
                libraryId,
                videoId,
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