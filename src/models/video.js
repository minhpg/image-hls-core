const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    fileId : {
        type: String,
        required: true
    },
    downloaded: {
        type: Boolean,
        required: true
    },
    uploaded: {
        type: Boolean,
        required: true
    },
    error: {
        type: Boolean,
        required: true
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

module.exports = mongoose.model('video', videoSchema)