const downloadQueue = require('../../queues/download')
const videoSchema = require('../../models/video')
module.exports = async (req, res) => {
    try { 
        const playlistUrl = req.query.playlistUrl
        const fileId = req.params.id
        const video = await videoSchema.findOne({fileId}).exec()
        if(!video) throw new Error('video not found!')
        await downloadQueue.add(fileId, {
            fileId, playlistUrl
        })
        res.json({
            status: 'success',
            message: 'file started',
        })
    }
    catch(err) {
        res.json({
            status: 'failed',
            message: err.message,
        })
    }
}