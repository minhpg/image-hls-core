const BunnyVideo = require('../../bunny-api/video')
const fileSchema = require('../../db/schemas/file')

module.exports = async (req, res) => {
    try {
        const id = req.params.id
        const file = await fileSchema.deleteOne({ id }, {_id: false}).exec()
        if(file.uploadedTo.uploaded) {
            const { videoId, libraryId, libraryAccessKey } = file
            const videoClient = new BunnyVideo(libraryAccessKey)
            await videoClient.deleteVideo(libraryId, videoId)
        }
        res.json({
            success: true,
            message: 'file deleted!'
        })
    }
    catch (err) {
        res.json({
            success: false,
            message: err.message
        })
    }
}