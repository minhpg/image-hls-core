const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    res: {
        type : String,
        required: true
    },
    bandwidth: Number,
    allowCache: Boolean,
    discontinuityStarts: Array,
    segments : {
        type: Array,
        required: true
    },
    version: {
        type: Number,
        required: true
    },
    targetDuration: {
        type: Number,
        required: true
    },
    mediaSequence : {
        type: Number,
        required: true
    },
    discontinuitySequence: {
        type: Number,
        required: true
    },
    endList: {
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model('file', fileSchema)