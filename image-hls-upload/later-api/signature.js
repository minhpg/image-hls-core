const Crypto = require("crypto-js");
const strftime = require('strftime');
const crypto = require('crypto');
const fs = require('fs');

const getFileHash = (file) => {
    const fileBuffer = fs.readFileSync(file);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);

    const hex = hashSum.digest('hex');

    return hex
}
function sign(key, msg) {
    return Crypto.HmacSHA256(msg, key, { asBytes: true });
}

function getSignatureKey(key, dateStamp, regionName, serviceName) {
    const kDate = sign(dateStamp, 'AWS4' + key);
    const kRegion = sign(regionName, kDate);
    const kService = sign(serviceName, kRegion);
    const kSigning = sign('aws4_request', kService);

    return kSigning;
}

function sha256(str) {
    return Crypto.SHA256(str);
}

const generateHeaders = ({file, AccessKeyId, SecretKey, SessionToken, filename}) => {
    // ************* REQUEST VALUES *************
    const method = 'PUT';
    const service = 's3-accelerate';
    const host = 'later-incoming.s3-accelerate.amazonaws.com';
    const region = 'us-east-1';
    const endpoint = `https://later-incoming.s3-accelerate.amazonaws.com/${filename}`;
    const request_parameters = 'x-id=PutObject';
    const invocationId = '4cb4f5e5-78b7-4797-9d25-6773c79b30e8'
    const sdkRequest = 'attempt=1; max=3'
    const contentType = 'image/png'
    const amzUA = 'aws-sdk-js/3.88.0 os/macOS/10.15.7 lang/js md/browser/Chrome_100.0.4896.127 api/s3/3.88.0'

    const date = new Date();
    const amzdate = strftime('%Y%m%dT%H%M%SZ', date);
    const datestamp = strftime('%Y%m%d', date);

    // ************* TASK 1: CREATE A CANONICAL REQUEST *************
    const canonical_uri = '/';
    const canonical_querystring = request_parameters;
    const file_hash = getFileHash(file)
    const headerItems = {
        'content-type': contentType,
        host: host,
        'x-amz-content-sha256': file_hash,
        'x-amz-date': amzdate,
        'x-amz-security-token': SessionToken,
        'x-amz-user-agent': amzUA
    }
    // const canonical_headers = 'host:' + host + '\n' + 'x-amz-date:' + amzdate + '\n'
    // const signed_headers = 'content-type;host;x-amz-content-sha256;x-amz-date;x-amz-security-token;x-amz-user-agent';

    const canonical_headers = Object.keys(headerItems).map((key, index) => {
        return `${key}:${headerItems[key]}`
    }).join('\n')

    const signed_headers = Object.keys(headerItems).map((key, index) => {
        return key
    }).join(';')

    console.log(canonical_headers)
    console.log(signed_headers)

    const payload_hash = file_hash
    const canonical_request = method + '\n' + canonical_uri + '\n' + canonical_querystring + '\n' + canonical_headers + '\n' + signed_headers + '\n' + payload_hash;

    // ************* TASK 2: CREATE THE STRING TO SIGN*************
    const algorithm = 'AWS4-HMAC-SHA256';
    const credential_scope = datestamp + '/' + region + '/' + service + '/' + 'aws4_request';
    const string_to_sign = algorithm + '\n' + amzdate + '\n' + credential_scope + '\n' + sha256(canonical_request);

    // ************* TASK 3: CALCULATE THE SIGNATURE *************
    const signing_key = getSignatureKey(SecretKey, datestamp, region, service);
    const signature = sign(signing_key, string_to_sign);

    // ************* TASK 4: ADD SIGNING INFORMATION TO THE REQUEST *************
    const authorization_header = algorithm + ' ' + 'Credential=' + AccessKeyId + '/' + credential_scope + ', ' + 'SignedHeaders=' + signed_headers + ', ' + 'Signature=' + signature;
    const headers = { 
        'x-amz-date': amzdate, 
        'Authorization': authorization_header, 
        'x-amz-content-sha256': file_hash,
        Referer: 'https://app.later.com/',
        Origin: 'https://app.later.com',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
        'amz-sdk-invocation-id': invocationId,
        'amz-sdk-request': sdkRequest,
        'content-type': contentType,
        'x-amz-security-token': SessionToken,
        'x-amz-user-agent': amzUA

     }
    console.log(headers)
    return headers
}

// generateHeaders('base.png')
module.exports = generateHeaders