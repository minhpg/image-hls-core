const base64 = require('base-64')
// const redisClient = require('../redis')
// const imageProxy = require('../google-drive-api/imageProxyV2')

const decodeUrl = (str) => {
    var newString = ""
    for (var i = str.length - 1; i >= 0; i--) {
        newString += str[i]
    }
    return base64.decode(newString)
}

module.exports = async (req, res) => {
    res.setHeader('access-control-allow-origin', process.env.CORS_DOMAIN || '*')
    // redisClient.get(req.params.url, async (err, data) => {
    //     try {
    //         if (err) {
    //             res.json({
    //                 status: 'fail',
    //                 message: err.message,
    //             })
    //             return
    //         }
    //         if (!data) {
    //             const url = decodeUrl(req.params.url)
    //             proxy_url = await imageProxy(url)
    //             redisClient.setex(req.params.url, 60 * 60 * 1, proxy_url, (err) => {
    //                 if (err) throw err
    //                 return
    //             })
    //         }
    //         else {
    //             proxy_url = data
    //         }
    //         res.redirect(proxy_url)
    //         return
    //     }
    //     catch (err) {
    //         res.status(404)
    //         res.end()
    //         return
    //     }
    // })
    const url = decodeUrl(req.params.url)
    res.redirect(url)

}