const CronJob = require('cron').CronJob;
const {sendMessage} = require('./telegram-api/sendMessage')
const imageProxy = require('./google-drive-api/imageProxyV3')
require('dotenv').config()

const task = new CronJob('*/30 * * * *', async () =>  {
const time = new Date().toLocaleString('en-US', {
  timeZone: 'Asia/Ho_Chi_Minh'
});
    console.log(time)
    try {
        const url = await imageProxy('https://live.staticflickr.com/65535/51343780297_4b2882c488_o_d.png')
        await sendMessage(`*Check\n${process.env.HOST}\nImage cookie live - `+time)
    }
    catch(err){
        console.error(err.message)
        await sendMessage(`*Error\n${process.env.HOST}\nImage cookie died - ${err.message} - `+time)
    }
}, null, true, 'Asia/Ho_Chi_Minh');


task.start();
console.log(task.running);
