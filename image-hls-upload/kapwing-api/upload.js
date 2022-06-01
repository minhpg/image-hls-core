const axios = require('axios')
const uuid = require('uuid')
const fs = require('fs')
const got = require('got')

const getUploadBucket = async () => {
    const options = {
        method: 'POST',
        url: 'https://us-central1-kapwing-181323.cloudfunctions.net/create_resumable_upload',
        headers: {
            authority: 'us-central1-kapwing-181323.cloudfunctions.net',
            accept: 'application/json',
            'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5,ko;q=0.4',
            'content-type': 'application/json',
            dnt: '1',
            origin: 'https://www.kapwing.com',
            referer: 'https://www.kapwing.com/',
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="100", "Google Chrome";v="100"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'
        },
        data: {
            files: [
                {
                    bucketName: 'kapwing',
                    fileName: uuid.v4() + '.png',
                    fileType: 'image/png',
                    private: false
                }
            ]
        }
    };
    const response = await axios.request(options)
    const body = response.data
    return body
}

const uploadProcess = async (url, file) => {
    const options = {
        headers: {
            authority: 'www.googleapis.com',
            accept: '*/*',
            'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5,ko;q=0.4',
            'content-type': 'image/jpeg',
            dnt: '1',
            origin: 'https://www.kapwing.com',
            referer: 'https://www.kapwing.com/',
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="100", "Google Chrome";v="100"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
            'x-client-data': 'CJO2yQEIpbbJAQjEtskBCKmdygEIk6HLAQie+csBCOeEzAEIm5rMAQ=='
        },
        body: fs.createReadStream(file)
    };
    const response = await got.put(url, options)
    const body = response.body
    return body
}

const upload = async (file) => {
    const uploadData = await getUploadBucket()
    const { read_uri, upload_uri } = uploadData.uris[0]
    await uploadProcess(upload_uri, file)
    console.log(`uploaded ${file} to ${read_uri}`)
    return read_uri
}

module.exports =  upload