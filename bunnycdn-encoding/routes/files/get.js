const fileSchema = require('../../db/schemas/file')

module.exports = async (req, res) => {
    try {
        const id = req.params.id
        const file = await fileSchema.findOne({ id }, {_id: false}).exec()
        if (!file) throw new Error('file does not exist!')
        res.json({
            success: true,
            data: file
        })
    }
    catch (err) {
        res.json({
            success: false,
            message: err.message
        })
    }
}