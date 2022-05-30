const fileSchema = require('../../models/file')
const videoSchema = require('../../models/video')
const base64 = require('base-64')
const redisClient = require('../../redis')

const encodeUrl = (url) => {
    const str = base64.encode(url)
    var newString = "";
    for (var i = str.length - 1; i >= 0; i--) {
        newString += str[i];
    }
    return newString.replace(/=/g,'');
}

module.exports = (req, res) => {
    return new Promise((resolve, reject) => {
        redisClient.get(req.params.id, async (err, data) => {
            if (err) {
                reject(err)
            }
            if (data) {
                res.send(data)
                return resolve()
            }
            const video = await videoSchema.findOne({ _id: req.params.id, files: {$exists:true, $not: {$size: 0}} }).exec()
            if (!video) {
                res.status(404)
                res.json({ message: 'fail', message: 'file not found' })
                return resolve()
            }
            const file = await fileSchema.findOne({_id:video.files[0]._id}).exec()
            if (!file) {
                res.status(404)
                res.json({ message: 'fail', message: 'file not found' })
                return resolve()
            }
            var playlist = [
                `#EXTM3U`,
                `#EXT-X-VERSION:${file.version}`,
                `#EXT-X-PLAYLIST-TYPE:VOD`,
                `#EXT-X-TARGETDURATION:${file.targetDuration}`,
                `#EXT-X-MEDIA-SEQUENCE:0`,
            ]
            const promises = file.segments.map((segment,index) => {
                return new Promise((resolve, reject) =>{
                    encoded_url = encodeUrl(segment.url)
                    resolve(`${process.env.HOST}/api/hls/${encoded_url}`) 
                })
            })
            await Promise.all(promises).then(segments => {
                index = 0
                for (const segment of segments) {
                    playlist.push(`#EXTINF:${file.segments[index].duration},`)
                    playlist.push(segment)
                    index += 1
                }
                playlist.push('#EXT-X-ENDLIST')
            }).then(() => {
                const body = playlist.join('\n')
                redisClient.setex(req.params.id, 20*3600, body, (err) => {
                    if (err) {
                        reject(err)
                    }
                    res.send(body)
                    return resolve()
                })
            })
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
