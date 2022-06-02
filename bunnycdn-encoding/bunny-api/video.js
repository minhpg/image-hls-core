const axios = require('axios')
const rp = require('request-promise')
const fs = require('fs')

class BunnyVideoError extends Error {
    constructor({type, title, status, errors}) {
        super(`${status} - ${title} - ${errors ? JSON.stringify(errors) : type}`)
        this.type = type
        this.title = title
        this.status = status
        this.errors = errors
    }
}
class BunnyVideo {

    videoPrefix = 'http://video.bunnycdn.com/'

    constructor (accessKey) {
        this.accessKey = accessKey
        this.request = axios.create({
            headers: {
                AccessKey: accessKey
            }
        })
    }

    async fetch (url, method, body) {
        try{
            const response = await this.request({
                url,
                method,
                data: body
            })
            console.log(response.data)
            return response.data
        }
        catch(err) {
            const { response } = err
            if(response){
                console.log(response)
                if(response.data){
                    throw new BunnyVideoError(response.data)
                }
            }
            else {
                console.log(err)
                throw err
            }

        }
    }

    getVideo (libraryId, videoId) {
        const url = `${this.videoPrefix}library/${libraryId}/videos/${videoId}`
        const method = 'GET'
        return this.fetch(url, method)
    }

    // updateVideo (libraryId, videoId) {
    //     const url = `${this.videoPrefix}library/${libraryId}/videos/${videoId}`
    //     const method = 'GET'
    //     return this.fetch(url, method)
    // }

    deleteVideo (libraryId, videoId) {
        const url = `${this.videoPrefix}library/${libraryId}/videos/${videoId}`
        const method = 'DELETE'
        return this.fetch(url, method)
    }

    createVideo (libraryId, title) {
        const url = `${this.videoPrefix}library/${libraryId}/videos`
        const method = 'POST'
        title ? title : title = Date.now()+'.mp4'
        const body = {
            title 
        }
        return this.fetch(url, method, body)
    }

    async uploadVideo (libraryId, videoId, file) {
        const url = `${this.videoPrefix}library/${libraryId}/videos/${videoId}`
        const response = await rp.put(url, {
            body: fs.createReadStream(file),
            headers: {
                AccessKey: this.accessKey
            }
        })
        const { success, message, statusCode } = JSON.parse(response)
        if(!success) throw new BunnyVideoError({ title: message, status: statusCode})
        return success
    }
    
    async createAndUploadVideo (libraryId, file) {
        const videoInfo = await this.createVideo(libraryId)
        const { guid } = videoInfo
        await this.uploadVideo(libraryId, guid, file)
        return guid
    }

}
    
// const client = new BunnyVideo(
//     '609d8533-59ba-43ad-b87948dd69d6-3a72-44f1'
// )

// client.createAndUploadVideo('42171', 'test.mp4')
// client.uploadVideo('42171','7a372abf-4e1c-403c-9802-487213480d97','test.mp4')
// client.deleteVideo('43572','d4e4045d-3d7e-4152-aef1-9506047376e5')
module.exports = BunnyVideo