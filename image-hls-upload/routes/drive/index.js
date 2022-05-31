const express = require('express')
const router = express.Router()

router.get('/delete/:id', require('./delete'))
router.get('/retry', require('./retries'))
router.get('/retry/:id', require('./retry'))
router.get('/create/:id', require('./create'))
router.get('/get/:id', require('./get'))

module.exports = router