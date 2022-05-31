const express = require('express')
require('dotenv').config()
require('./db/init')()

const PORT = process.env.BUNNYCDN_PORT || 3000
const app = express()

app.use('/api', (req, res, next) => {
    const key = req.query.key
    if(process.env.API_KEY){
        if (key != process.env.API_KEY) {
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

app.use('/api/files', require('./routes/files'))
app.use('/api/worker', require('./routes/worker'))

app.listen(PORT, async () => {
    console.log(`listening on port ${PORT}`)
})