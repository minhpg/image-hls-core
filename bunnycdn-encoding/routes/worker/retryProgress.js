const progressQueue = require('../../queues/progress')
const { fileSchema } = require('../../db')
module.exports = async (req, res) => {
    try {
        const id = req.params.id
        const file = await fileSchema.findOne({ id }).exec()
        if (!file) throw new Error('file does not exist!')
        if (!file.uploadedTo.uploaded) throw new Error('file is not uploaded')
        const { libraryId, videoId, libraryAccessKey } = file.uploadedTo
        await progressQueue.add(id, {
            fileId: id, 
            libraryId: libraryId, 
            videoId: videoId, 
            accessKey: libraryAccessKey
        })
        res.json({
            success: true,
            message: 'file checking!'
        })
    }
    catch (err) {
        res.json({
            success: false,
            message: err.message
        })
    }
}