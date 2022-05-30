const axios = require('axios')
const videoSchema = require('../../models/video')
const videoQueue = require('../../queues/download')

module.exports = async (req,res) => {
    const fileId = req.params.id
    const original = req.query.original
    const video_in_db = await videoSchema.findOne({fileId}).exec()
    if(video_in_db){
        res.json({
            status: 'failed',
            message: 'video existed',
            fileId : video_in_db.fileId
        })
        res.end()
    }
    else {
        const video = new videoSchema({
            fileId,
            processing: true,
            error: false
        })
        await video.save()
        await axios.get(`http://localhost:${process.env.BUNNYCDN_PORT}/api/create/`+fileId)
        videoQueue.add(fileId, { fileId , original})        
        res.json({
            status: 'ok',
            message: 'video created',
            fileId
        })
        res.end()
    }
}