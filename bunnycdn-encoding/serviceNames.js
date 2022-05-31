require('dotenv').config();

module.exports = {
    DOWNLOAD: process.env.SERVICE_NAME+'_BUNNYDOWNLOAD',
    PROGRESS: process.env.SERVICE_NAME+'_BUNNYPROGRESS',
    UPLOAD: process.env.SERVICE_NAME+'_BUNNYUPLOAD'
}