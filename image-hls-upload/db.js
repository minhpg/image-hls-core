const mongoose = require('mongoose');

module.exports = async () => {
    await mongoose.connect(process.env.MONGO_DB || 'mongodb://127.0.0.1/kapwing', { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
}