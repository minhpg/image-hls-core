const videoSchema = require('../../models/video')
const bunnyFileSchema = require('../../../bunnycdn-encoding/db/schemas/file')
const downloadQueue = require('../../../bunnycdn-encoding/queues/download')
module.exports = async (req,res) => {
    const fileId = req.params.id
    const original = req.query.original
    const video_in_db = await videoSchema.findOne({fileId}).exec()
    if(!video_in_db){
        res.json({
            status: 'failed',
            message: 'video does not exist',
        })
        res.end()
    }
    else {
        const file = await bunnyFileSchema.findOne({ id: fileId }).exec()
        if(file) await file.deleteOne()
        const newFile = new bunnyFileSchema({ id: fileId })
        await newFile.save()
        await downloadQueue.add(fileId, {
            fileId 
        })
        res.json({
            status: 'ok',
            message: 'video retried',
            fileId
        })
        res.end()
    }
}