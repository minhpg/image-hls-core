const axios = require('axios')
const JSSoup = require('jssoup').default

const extractPlaylistUrl = async (libraryId, videoId) => {
    const url = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=true`
    const response = await axios.get(url, {
        headers: {
            referer: 'https://video.bunnycdn.com/'
        }
    })
    const html = response.data
    const soup = new JSSoup(html)
    const source = soup.find('source')
    return source.attrs.src
}

// extractPlaylistUrl('42171','5ca8d018-d589-4af5-985c-1cc38346bdef')

module.exports = extractPlaylistUrl