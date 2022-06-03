const videoSchema = require('../../models/video')


module.exports = async (req, res) => {
    const fileId = req.params.id
    const video = await videoSchema.findOne({ fileId }).exec()
    if (video) {
        var data = {
            original: video.original,
            error: video.error,
            error_message: video.error_message,
            uploaded: video.uploaded,
            embed: `${process.env.HOST}/api/iframe/${video._id}`,
            playlist: `${process.env.HOST}/api/m3u8/${video._id}/master.m3u8`
        }

        res.json({
            status: 'ok',
            data: data
        })
    }
    else {
        res.json({
            status: 'error',
            message: 'video does not exist'
        })
    }
    res.end()
}