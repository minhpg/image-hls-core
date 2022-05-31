const fileSchema = require('../../db/schemas/file')
const downloadQueue = require('../../queues/download')

module.exports = async (req, res) => {
    try {
        const id = req.params.id
        const file = await fileSchema.findOne({ id }).exec()
        if (file) throw new Error('file existed!')
        const new_file = new fileSchema({
            id
        })
        await new_file.save()
        await downloadQueue.add(id, {
            fileId: id, 
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