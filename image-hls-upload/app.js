const express = require('express');
require('dotenv').config()
const rateLimit = require("express-rate-limit");
const app = express();
const bodyParser = require('body-parser')
require('./db')()

const PORT = process.env.HLS_PORT || 3000

app.set('view engine', 'ejs')
app.use(bodyParser.json())
app.use('/api', async (req, res, next) => {
    if (process.env.API_KEY) {
        if (req.query.key != process.env.API_KEY) {
            res.status(404)
            res.end()
        }
        else {
            next()
        }
    }
    else {
        next()
    }
})

app.get('/api/drive/delete/:id', require('./routes/drive/delete'))
app.get('/api/drive/retry', require('./routes/drive/retries'))
app.get('/api/drive/retry/:id', require('./routes/drive/retry'))
app.get('/api/drive/create/:id', require('./routes/drive/create'))
app.get('/api/drive/get/:id', require('./routes/drive/get'))
app.get('/api/webhook', require('./routes/webhook'))

app.use('/api/stat', require('./routes/stat'))

app.use('/dist', express.static('static'))

const limiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/m3u8', limiter, require('./routes/playlist'))


app.get('/api/hls/:url',
    require('./routes/chunks'))


app.get('/api/iframe/:id', require('./routes/embed/iframe'))
app.get('/api/player/:id', require('./routes/embed/api'))


app.listen(PORT, async () => {
    console.log(`listening on port ${PORT}`)
})