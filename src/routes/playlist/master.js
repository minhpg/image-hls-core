const fileSchema = require('../../models/file')
const videoSchema = require('../../models/video')
const base64 = require('base-64')
const redisClient = require('../../redis')

module.exports = (req, res) => {
    return new Promise((resolve, reject) => {
        redisClient.get(req.params.id, async (err, data) => {
            if (err) {
                reject(err)
            }
            if (data) {
                res.send(data)
                resolve()
            }
            const video = await videoSchema.findOne({ _id: req.params.id }).exec()
            if (!video) {
                res.status(404)
                res.json({ message: 'fail', message: 'video not found' })
                resolve()
            }
            const files = await video.files.map((info) => {
                console.log(info)
                return fileSchema.findOne({
                    uploaded: true,
                    ...info
                },
                    {
                        segments: false
                    }
                ).exec()
            })
            var playlist = [
                `#EXTM3U`,
                `#EXT-X-VERSION:3`,
            ]
            for (const file of files) {
                playlish.push(`#EXT-X-STREAM-INF:BANDWIDTH=${file.res * 250},RESOLUTION=${Math.round(file.res / 9 * 16)}x${file.res}`)
                playlist.push(`${process.env.HOST}/api/m3u8/${file._id}/${file.res}/video.m3u8`)
            }
            playlist.push('#EXT-X-ENDLIST')
            const body = playlist.join('\n')
            // redisClient.setex(req.params.id, 20 * 3600, body, (err) => {
            //     if (err) {
            //         reject(err)
            //     }
            //     res.send(body)
            //     resolve()
            // })
            res.send(body)
        })
    })
        .catch(err => {
            res.json({
                status: 'fail',
                message: err.message
            })
            return
        })

}
