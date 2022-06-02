const videoSchema = require('../../models/video')
const bunnyFileSchema = require('../../../bunnycdn-encoding/db/schemas/file')
const downloadQueue = require('../../../bunnycdn-encoding/queues/download')
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
        const file = await bunnyFileSchema.findOne({ fileId }).exec()
        if (file) throw new Error('file existed!')
        const new_file = new bunnyFileSchema({
            id: fileId
        })
        await new_file.save()
        console.log(new_file)
        await downloadQueue.add(fileId, {
            fileId 
        })
        res.json({
            status: 'ok',
            message: 'video created',
            fileId
        })
        res.end()
    }
}