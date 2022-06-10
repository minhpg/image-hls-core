const got = require('got');
const qs = require('querystring')

const sendMessage = async (message) => {
    if(process.env.TELEGRAM_TOKEN){
        const response = await got.get(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage?chat_id=-${process.env.TELEGRAM_CHAT_ID}&text=${qs.escape(message)}`)
        console.log('sent message to telegram')
    }
}

module.exports = sendMessage