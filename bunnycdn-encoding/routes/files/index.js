const { Router } = require('express')

const router = Router()

router.get('/create/:id', require('./create'))
router.get('/retry/:id', require('./retry'))
router.get('/get/:id', require('./get'))
router.get('/delete/:id', require('./delete'))

module.exports = router