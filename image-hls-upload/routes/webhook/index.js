const { fileSchema } = require('../../../bunnycdn-encoding/db')
const progressQueue = require('../../../bunnycdn-encoding/queues/progress')
module.exports = async (req, res) => {
    try {
        console.log(req.body)
        const { VideoLibraryId, VideoGuid, Status } = req.body
        const file = await fileSchema.findOne({ 'uploadedTo.videoId': VideoGuid, 'uploadedTo.libraryId': VideoLibraryId }).exec()
        if (file && Status == 3) {
            const { id, uploadedTo } = file
            const { libraryId, videoId, libraryAccessKey } = uploadedTo
            await progressQueue.add(id, {
                fileId: id,
                libraryId,
                videoId,
                accessKey: libraryAccessKey
            }, {
                jobId: id
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