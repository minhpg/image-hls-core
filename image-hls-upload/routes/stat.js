const videoSchema = require('../models/video')
const express = require('express')
const router = express.Router()

router.get('/videos', async (req,res) => {
    let doneCount = 0
    const totalDocuments = await videoSchema.countDocuments({}).exec()
    const completed_videos = await videoSchema.find({error:false}, {files: true}).exec()
    const files = []
    for (const { _id } of video.files) {
        const file = await fileSchema.findOne({ _id, uploaded: true }, { uploaded: true }).exec()
        if (file) files.push(file)
    }
    if (files.length == video.files.length) doneCount += 1
    const errors = await videoSchema.countDocuments({error:true}).exec()
    res.json({
        done: doneCount,
        processing: totalDocuments - errors - doneCount,
        errors: errors
    })
    return
})

router.get('/errors', async (req,res) => {
    const error_videos = await videoSchema.find({error:true}).select({_id:0,error_message:1,drive_id:1}).sort({_id:-1}).exec()
    res.json(error_videos)
    return
})

router.get('/done', async (req,res) => {
    const error_videos = await videoSchema.find({"files.0": { "$exists": true }}).select({_id:0,title:1,drive_id:1}).sort({_id:-1}).limit(100).exec()
    res.json(error_videos)
    return
})

router.get('/processing', async (req,res) => {
    const error_videos = await videoSchema.find({processing:true}).select({_id:0,drive_id:1}).sort({_id:-1}).exec()
    res.json(error_videos)
    return
})

router.get('/clear-errors', async (req,res) => {
    try {
        const error_videos = await videoSchema.deleteMany({error:true}).exec()
        res.json({
            status: 'ok' 
        })
    }
    catch(err) {
        res.json({
            status: 'failed',
            message: err.message
        })
    }
    return
})

module.exports = router