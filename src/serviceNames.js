require('dotenv').config();

module.exports = {
    DOWNLOAD: process.env.SERVICE_NAME+'_DOWNLOAD',
    UPLOAD: process.env.SERVICE_NAME+'_UPLOAD'
}