const downloadQueue = require('../../queues/download')
const { fileSchema } = require('../../db')
module.exports = async (req, res) => {
    try {
        const id = req.params.id
        const file = await fileSchema.findOne({ id }).exec()
        if (!file) throw new Error('file does not exist!')
        await downloadQueue.add(id, {
            fileId: id
        })
        res.json({
            success: true,
            message: 'file created!'
        })
    }
    catch (err) {
        res.json({
            success: false,
            message: err.message
        })
    }
}