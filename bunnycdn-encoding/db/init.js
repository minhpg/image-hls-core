require('dotenv').config()
const mongoose = require('mongoose')

module.exports = () => {
    mongoose.connect(process.env.MONGO_DB || 'mongodb://127.0.0.1/bunnycdn')
}