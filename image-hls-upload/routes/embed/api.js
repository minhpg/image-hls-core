const videoSchema = require('../../models/video')
const fileSchema = require('../../models/file')

module.exports = async (req, res) => {
    try {
        const id = req.params.id
        const video = await videoSchema.findOne({ _id: id }).exec()
        if (!video) throw new Error('video does not exist!')
        let data = {}
        const files = []
        for (const { _id } of video.files) {
            const file = await fileSchema.findOne({ _id, uploaded: true }, { segments: false }).exec()
            if (file) files.push(file)
        }
        console.log(video.files.length)
        if (video.files.length != 0 && files.length < video.files.length) {
            if (!video.original) throw new Error('video is processing!')
            data = {
                file: video.original,
                type: 'mp4'
            }
        }
        else {
            data = {
                file: `${process.env.HOST}/api/m3u8/${video._id}/master.m3u8`,
                type: 'hls'
            }
        }
        res.json({
            success: true,
            data
        })
    }
    catch (err) {
        res.json(
            {
                success: false,
                message: err.message
            }
        )
    }
}