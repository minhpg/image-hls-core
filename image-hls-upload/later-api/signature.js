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

const generateHeaders = (file, access_key, secret_key) => {
    // ************* REQUEST VALUES *************
    const method = 'PUT';
    const service = 's3-accelerate';
    const host = 'later-incoming.s3-accelerate.amazonaws.com';
    const region = 'us-east-1';
    const endpoint = 'https://later-incoming.s3-accelerate.amazonaws.com';
    const request_parameters = '';

    const date = new Date();
    const amzdate = strftime('%Y%m%dT%H%M%SZ', date);
    const datestamp = strftime('%Y%m%d', date);

    // ************* TASK 1: CREATE A CANONICAL REQUEST *************
    const canonical_uri = '/';
    const canonical_querystring = request_parameters;
    const canonical_headers = 'host:' + host + '\n' + 'x-amz-date:' + amzdate + '\n';
    const signed_headers = 'amz-sdk-invocation-id;amz-sdk-request;content-length;content-type;host;x-amz-content-sha256;x-amz-date;x-amz-security-token;x-amz-user-agent';
    const file_hash = getFileHash(file)

    const payload_hash = file_hash
    const canonical_request = method + '\n' + canonical_uri + '\n' + canonical_headers + '\n' + signed_headers + '\n' + payload_hash;

    // ************* TASK 2: CREATE THE STRING TO SIGN*************
    const algorithm = 'AWS4-HMAC-SHA256';
    const credential_scope = datestamp + '/' + region + '/' + service + '/' + 'aws4_request';
    const string_to_sign = algorithm + '\n' + amzdate + '\n' + credential_scope + '\n' + sha256(canonical_request);

    // ************* TASK 3: CALCULATE THE SIGNATURE *************
    const signing_key = getSignatureKey(secret_key, datestamp, region, service);
    const signature = sign(signing_key, string_to_sign);

    // ************* TASK 4: ADD SIGNING INFORMATION TO THE REQUEST *************
    const authorization_header = algorithm + ' ' + 'Credential=' + access_key + '/' + credential_scope + ', ' + 'SignedHeaders=' + signed_headers + ', ' + 'Signature=' + signature;
    const headers = { 
        'x-amz-date': amzdate, 
        'Authorization': authorization_header, 
        'x-amz-content-sha256': file_hash
     };
    console.log(headers)
    return headers
}

// generateHeaders('base.png')
module.exports = generateHeaders