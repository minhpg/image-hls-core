const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    fileId : {
        type: String,
        required: true
    },
    original: {
        type: String,
    },
    downloaded: {
        type: Boolean,
        default: false
    },
    error: {
        type: Boolean,
        default: false
    },
    error_message : {
        type: String
    },
    files : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'file'
        }
    ]
});

module.exports = mongoose.model('hls-videos', videoSchema)