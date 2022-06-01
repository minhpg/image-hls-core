const mongoose = require('mongoose');
const flat = require('flat')

const fileSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    uploadedTo: {
        uploaded: {
            type: Boolean,
            default: false
        },
        libraryId: String,
        videoId: String,
        libraryAccessKey: String,
        pullZone: String,
        retry: { type: Number, default: 0},
        error: {
            type: Boolean,
            default: false
        },
        error_message: {
            type: String
        }
    },
    downloadedTo: {
        downloaded: {
            type: Boolean,
            default: false
        },
        path: String,
        retry: { type: Number, default: 0},
        error: {
            type: Boolean,
            default: false
        },
        error_message: {
            type: String
        }
    },
    renderProgress: {
        progress: Number,
        url: String,
        status: String,
        proceedToDownload: {
            type: Boolean,
            default: false
        },
        error: {
            type: Boolean,
            default: false
        },
        error_message: {
            type: String
        }
    }
},
    {
        timestamps: true
    });

fileSchema.pre('findOneAndUpdate', function () {
    this._update = flat(this._update);
});

module.exports = mongoose.model('bunnycdn-file', fileSchema)