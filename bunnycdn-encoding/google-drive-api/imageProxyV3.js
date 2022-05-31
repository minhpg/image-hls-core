const got = require('got')
const qs = require('querystring')

module.exports = async (proxy_url) => {
    try {
        const url = `https://mail.google.com/mail/u/0/piu?ui=2&url=${qs.escape(proxy_url)}&pcd=1&cfact=7758%2C7057%2C7514%2C7546%2C7496%2C7433%2C7782%2C7030%2C7113%2C7682%2C7416%2C7594%2C7677%2C7766%2C7518%2C7424%2C7753&cfinact=7543%2C7512%2C7056%2C7082%2C7563%2C7521%2C7799%2C7754%2C7058%2C7640%2C7084%2C7767%2C7577%2C7117%2C7544%2C7580%2C7595%2C7421%2C7085%2C7086%2C7684%2C7802%2C7689%2C7683%2C7083%2C7690&mb=0&rt=j`
        const headers = {
			'cache-control': 'no-cache',
			'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
			'cookie': process.env.MAIL_COOKIE,
            'referer': 'https://mail.google.com/mail/u/0/',
			'user-agent': process.env.USER_AGENT
        }

        const response = await got.post(url, {
            form: {
                url: proxy_url,
            },
            headers: headers
        });
        const json_data = JSON.parse(response.body.replace(`)]}'`,'').trim())
        raw_url = json_data[0][0][1][0][1]
        final_url = raw_url.split('#')[0].replace('-d-e1-ft','').replace('ci','lh').replace('googleusercontent','ggpht')
        return final_url
    }
    catch (err) {
        throw new Error('cookie dead')
    }
}
