const { Router } = require('express')

const router = Router()

router.get('/download/:id', require('./retryDownload'))
router.get('/upload/:id', require('./retryUpload'))
router.get('/progress/:id', require('./retryProgress'))

module.exports = router