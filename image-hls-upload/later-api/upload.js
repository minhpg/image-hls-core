const got = require('got')
const axios = require('axios')
const fs = require('fs')
const generateHeaders = require('./signature')
const uuid = require('uuid')

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
        {"IdentityId":"us-east-1:d75cb0da-f729-47b1-a11b-92156644766c"}
        , options)
    const { Credentials } = response.data
    if(Credentials) return Credentials

}

const fileUpload = async ({file, filename, SessionToken, AccessKeyId, SecretKey}) => {
    const url = 'https://later-incoming.s3-accelerate.amazonaws.com/'
    const authHeaders = generateHeaders(file, AccessKeyId, SecretKey)
    const headers = {
        ...authHeaders,
        Referer: 'https://app.later.com/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
        'amz-sdk-invocation-id': '4cb4f5e5-78b7-4797-9d25-6773c79b30e8',
        'amz-sdk-request': 'attempt=1; max=3',
        'content-type': 'image/png',
        'x-amz-security-token': SessionToken,
        'x-amz-user-agent': 'aws-sdk-js/3.88.0 os/macOS/10.15.7 lang/js md/browser/Chrome_100.0.4896.127 api/s3/3.88.0'
      }
      console.log(headers)
    await got.put(url,{
        body: fs.createReadStream(file),
        headers
    })
}

const upload = async (file) => {
    const credentials = await getCredentials()
    const filename = `uploads-${uuid.v4()}.png`
    await fileUpload({...credentials, filename, file})
}

upload('base.png')