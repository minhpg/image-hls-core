require('dotenv').config();

module.exports = {
    DOWNLOAD: process.env.SERVICE_NAME+'_HLSDOWNLOAD',
    UPLOAD: process.env.SERVICE_NAME+'_HLSUPLOAD'
}