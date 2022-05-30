const express = require('express')
const router = express.Router()
// const domains = require('../../../domains.json')
// const checkReferrer = require('check-referrer');

router.use((req, res, next) => {
    res.setHeader('access-control-allow-origin',process.env.CORS_DOMAIN || '*')
    res.setHeader('content-type','text/plain')
    // res.setHeader('content-type','application/vnd.apple.mpegurl')
    next()
  })

// const domainsWhitelist = domains.map(domain => {return '-'+domain})
// console.log(domainsWhitelist.join(','))

// router.use(checkReferrer(domainsWhitelist.join(','), 'https://google.com'))

router.get('/:id/master.m3u8',require('./quality')) 

module.exports = router
