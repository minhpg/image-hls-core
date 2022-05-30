const m3u8Parser = require('m3u8-parser')
const axios = require('axios')
const got = require('got')
const path = require('path')
const fs = require('fs')
const inject = require('./inject')

const fetchMasterPlaylist = async (url) => {
    const response = await axios.get(url, {
        headers: {
            referer: 'https://video.bunnycdn.com/'
        }
    })
    const data = response.data
    const parser = new m3u8Parser.Parser()
    parser.push(data)
    parser.end()
    console.log(parser.manifest.playlists)
    return parser.manifest.playlists

}

// fetchMasterPlaylist('https://vz-4a1846a9-986.b-cdn.net/7896e4ef-24ac-46c9-ac41-1ce655e7672a/playlist.m3u8')

const downloadPlaylist = async (url) => {
    const response = await axios.get(url, {
        headers: {
            referer: 'https://video.bunnycdn.com/'
        }
    })
    const data = response.data
    const parser = new m3u8Parser.Parser()
    parser.push(data)
    parser.end()
    return parser
}

const downloadSegment = (url, filePath) => {
    got(url, {
        headers: {
            referer: 'https://video.bunnycdn.com/'
        },
        isStream: true,
        retryCount: 10
    }).pipe(fs.createWriteStream(filePath))
}

const downloadSegmentInject = async (url, filePath) => {
    console.log(url)
    if(fs.existsSync(filePath)) return
    const data = await got.get(url, {
            headers: {
                referer: 'https://video.bunnycdn.com/'
            },
            responseType: 'buffer'
        })
    const imageBuffer = await fs.promises.readFile('base.png')
    await fs.promises.writeFile(filePath,  Buffer.from(Buffer.concat([imageBuffer, data.body]), 'binary'))
}

const mkdir = async (folderPath) => {
    if (!fs.existsSync(folderPath)) await fs.promises.mkdir(folderPath)
}

const downloadQualities = async (url, fileId, destinationFolder = 'downloads') => {
    try {
        await mkdir(destinationFolder)
        const folderPath = path.join(destinationFolder, fileId)
        await mkdir(folderPath)
        const qualities = []
        const playlists = await fetchMasterPlaylist(url)
        for (const playlist of playlists) {
            const playlistUrl = new URL(playlist.uri, url)
            const playlistData = await downloadPlaylist(playlistUrl.href)
            const segments = playlistData.manifest.segments
            const qualityPath = path.join(folderPath, playlist.attributes.RESOLUTION.height.toString())
            await mkdir(qualityPath)
            for (index in segments) {
                const segment = segments[index]
                const segmentPath = path.join(qualityPath, segment.uri)
                const segmentUrl = new URL(segment.uri, playlistUrl.href)
                await downloadSegmentInject(segmentUrl.href, segmentPath)
                segments[index] = segmentPath
            }
            playlistData.manifest.segments = segments
            playlistData.manifest.res =  playlist.attributes.RESOLUTION.height
            playlistData.manifest.bandwidth = playlist.attributes.bandwidth
            qualities.push(playlistData.manifest)
        }
        return qualities
    }
    catch (err) {
        console.log(err)
    }

}
// downloadQualities('https://vz-4a1846a9-986.b-cdn.net/7896e4ef-24ac-46c9-ac41-1ce655e7672a/playlist.m3u8', 'test')

module.exports = downloadQualities //('https://vz-4a1846a9-986.b-cdn.net/7896e4ef-24ac-46c9-ac41-1ce655e7672a/playlist.m3u8')
