const fetch = require('node-fetch');

module.exports = async (url) => {
    try {
        const response = await fetch("https://docs.google.com/picker/v2/geturl?origin=https%3A%2F%2Fdocs.google.com&authuser=0", {
            "headers": {
                "accept": "*/*",
                "accept-language": "vi-VN,vi;q=0.9",
                "cache-control": "no-cache",
                "content-type": "text/plain;charset=UTF-8",
                "pragma": "no-cache",
                "sec-ch-ua": "\"Chromium\";v=\"92\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"92\"",
                "sec-ch-ua-mobile": "?0",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
            },
            "referrer": "https://docs.google.com/",
            "referrerPolicy": "origin",
            "body": `[\"ureq\",[null,[[1,6,14],[\"image/bmp\",\"image/gif\",\"image/jpeg\",\"image/png\",\"image/tiff\",\"application/vnd.google-apps.folder\",\"application/vnd.google-apps.photoalbum\"],[],[]],[2],null,9007199254740991,[],null,\"https://docs.google.com/picker/v2/\",\"Chọn một tệp\",\"vi\",null,null,null,null,null,null,null,[5],null,[\"https://jamboard.google.com\",\":0\",2,2,[null,null],[null,null],[null,null]],null,null,28,\"jam-insert-image\",null,null,\"https://jamboard.google.com\",[],null,null,null,null,null,null,null],\"${url}\",0,0]`,
            "method": "POST",
            "mode": "cors"
        })
        const response_raw = await response.text()
        const json_data = JSON.parse(response_raw.replace(`)]}'`,'').trim())
        return json_data[0][1]
    }
    catch (err) {
        console.log(err)
        throw new Error('cookie dead')
    }
}