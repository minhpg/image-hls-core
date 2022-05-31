const videoSchema = require('../../models/video')
const videoQueue = require('../../queues/download')

module.exports = async (req, res) => {
    const fileId = req.params.id
    const original = req.query.original
    const video_in_db = await videoSchema.findOne({ fileId }).exec()
    if (!video_in_db) {
        res.json({
            status: 'failed',
            message: 'video does not exist',
            fileId: fileId
        })
        res.end()
    }
    else {
        await video_in_db.updateOne({
            processing: true,
            error: false,
            error_message: null
        }).exec()
        videoQueue.add(fileId, { fileId: fileId, original })
        res.json({
            status: 'ok',
            message: 'video queued',
            fileId: fileId
        })
        res.end()
    }
}