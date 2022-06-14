const got = require('got')
const axios = require('axios')
const fs = require('fs')
const generateHeaders = require('./signature')
const uuid = require('uuid')
var aws4 = require('aws4')
const strftime = require('strftime');
const crypto = require('crypto');


const getFileHash = (file) => {
    const fileBuffer = fs.readFileSync(file);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);

    const hex = hashSum.digest('hex');

    return hex
}


const getCredentials = async () => {
    const url = 'https://cognito-identity.us-east-1.amazonaws.com/'

    const options = {
        headers: {
            authority: 'cognito-identity.us-east-1.amazonaws.com',
            'amz-sdk-invocation-id': 'b29a7114-411e-4bc4-a3b1-d0b2583a2877',
            'amz-sdk-request': 'attempt=1; max=3',
            'content-type': 'application/x-amz-json-1.1',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
            'x-amz-target': 'AWSCognitoIdentityService.GetCredentialsForIdentity',
            referer: 'https://app.later.com/',
            'x-amz-user-agent': 'aws-sdk-js/3.87.0 os/macOS/10.15.7 lang/js md/browser/Chrome_100.0.4896.127 api/cognito_identity/3.87.0'
        },
    };

    const response = await axios.post(url,
        { "IdentityId": "us-east-1:d75cb0da-f729-47b1-a11b-92156644766c" }
        , options)
    const { Credentials } = response.data
    if (Credentials) return Credentials

}

const fileUpload = async ({ file, filename, SessionToken, AccessKeyId, SecretKey }) => {
    const url = `https://later-incoming.s3-accelerate.amazonaws.com/${filename}?x-id=PutObject`
    const method = 'PUT';
    const host = 'later-incoming.s3-accelerate.amazonaws.com';
    const region = 'us-east-1';
    const contentType = 'image/png'
    const amzUA = 'aws-sdk-js/3.88.0 os/macOS/10.15.7 lang/js md/browser/Chrome_100.0.4896.127 api/s3/3.88.0'
    const file_hash = getFileHash(file)
    const headers = {
        'content-type': contentType,
        'x-amz-content-sha256': file_hash,
        'x-amz-security-token': SessionToken,
        'x-amz-user-agent': amzUA
    }
    const awsCreds = aws4.sign({
        host: host,
        headers,
        method,
        path: '/' + filename + '?x-id=PutObject',
        service: 's3',
        region: region
    }, { accessKeyId: AccessKeyId, secretAccessKey: SecretKey })
    console.log(awsCreds)
    console.log(url)
    await got.put(url, {
        body: fs.createReadStream(file),
        headers: awsCreds.headers
    })
}

const finalize = async (filename, groupId, token, email) => {
    const response = await got.post("https://app.later.com/api/v2/media_items", {
        "headers": {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "accept-language": "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5,ko;q=0.4",
            "authorization": `Token token=\"${token}\", email=\"${email}\"`,
            "referrer": "https://app.later.com/6MMKC/media/",
        },
        json: {
            "media_item":
            {
                "active": true,
                "approved": true,
                "collect_source": null,
                "default_caption": "",
                "height": 1124,
                "latitude": null,
                "longitude": null,
                "media_type": "image",
                "original_filename": "image.png",
                "processing_bucket": "later-incoming",
                "processing_key": filename,
                "processing_url": null,
                "show_modal": false,
                "source_media_id": null,
                "source_post_id": null, "source_type": null, "source_url": null, "source_username": null, "transformation": {}, "width": 1124,
                "group_id": groupId, "submitted_by_id": null
            }, "group_id": groupId
        }
    }).json()
    return response
}

const upload = async (file, groupdId, token, email) => {
    const credentials = await getCredentials()
    const filename = `uploads-${uuid.v4()}.png`
    await fileUpload({ ...credentials, filename, file })
    const response = await finalize(filename, groupdId, token, email)
    console.log(`uploaded ${file} to https://d2my7ce9a6d57i.cloudfront.net/${response.media_item.image_key}`)
    return 'https://d2my7ce9a6d57i.cloudfront.net/'+response.media_item.image_key
}

module.exports = upload