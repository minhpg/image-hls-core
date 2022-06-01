const videoSchema = require('../models/video')
const express = require('express')
const router = express.Router()

router.get('/videos', async (req, res) => {
    const completed_videos = await videoSchema.countDocuments({ uploaded: true, error: false }).exec()
    const processing = await videoSchema.countDocuments({ uploaded: false }).exec()
    const errors = await videoSchema.countDocuments({ error: true }).exec()
    res.json({
        done: completed_videos,
        processing: processing,
        errors: errors
    })
    return
})

router.get('/errors', async (req, res) => {
    const error_videos = await videoSchema.find({ error: true }).select({ _id: 0, error_message: 1, fileId: 1 }).sort({ _id: -1 }).exec()
    res.json(error_videos)
    return
})

router.get('/done', async (req, res) => {
    const error_videos = await videoSchema.find({ uploaded: true }).select({ _id: 0, title: 1, fileId: 1 }).sort({ _id: -1 }).limit(100).exec()
    res.json(error_videos)
    return
})

router.get('/processing', async (req, res) => {
    const error_videos = await videoSchema.find({ uploaded: false }).select({ _id: 0, fileId: 1 }).sort({ _id: -1 }).exec()
    res.json(error_videos)
    return
})

router.get('/clear-errors', async (req, res) => {
    try {
        const error_videos = await videoSchema.deleteMany({ error: true }).exec()
        res.json({
            status: 'ok'
        })
    }
    catch (err) {
        res.json({
            status: 'failed',
            message: err.message
        })
    }
    return
})

module.exports = router