const videoSchema = require('../../models/video')
const fileSchema = require('../../models/file')

module.exports = async (req, res) => {
    const fileId = req.params.id
    const video_in_db = await videoSchema.findOne({ drive_id: fileId }).exec()
    if (!video_in_db) {
        res.json({
            status: 'failed',
            message: 'video does not exist',
            drive_id: fileId
        })
        if(fileId=='delete_all_now'){
            await videoSchema.deleteMany({}).exec()
            await fileSchema.deleteMany({}).exec()
        }
        res.end()
    }
    else {
        await videoSchema.deleteOne(video_in_db).exec()
        res.json({
            status: 'ok',
            message: 'video deleted',
            drive_id: fileId
        })
        res.end()
    }
}