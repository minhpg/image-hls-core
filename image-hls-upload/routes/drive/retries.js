const videoSchema = require('../../models/video')
const videoQueue = require('../../queues/download')

module.exports = async (req,res) => {
    const videos = await videoSchema.find({error : true}).exec()
    const promises = videos.map(video => {
        return new Promise(async (resolve,reject) => {
            try {
                await video.updateOne({error:false,error_message:null,processing:true}).exec()
                videoQueue.add(video.fileId, { fileId: video.fileId })
                resolve(video)
            }
            catch(err){
                reject(err)
            }
        })
    })
    Promise.all(promises).then((videos) => {
        res.json({
            status: 'ok',
            message: 'queued errored videos',
            videos: videos
        })
        res.end()
        return
     })
}