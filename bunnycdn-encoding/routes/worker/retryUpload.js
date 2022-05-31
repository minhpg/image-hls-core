const uploadQueue = require('../../queues/upload')
const { fileSchema } = require('../../db')
module.exports = async (req, res) => {
    try {
        const id = req.params.id
        const file = await fileSchema.findOne({ id }).exec()
        if (!file) throw new Error('file does not exist!')
        if (!file.downloadedTo.downloaded) throw new Error('file is not downloaded')
        await uploadQueue.add(id, {
            fileId: id, 
            path: file.downloadedTo.path, 
        })
        res.json({
            success: true,
            message: 'file uploading!'
        })
    }
    catch (err) {
        res.json({
            success: false,
            message: err.message
        })
    }
}