const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
    cookie : {
        type: String, 
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password :{
        type: String,
        required: true
    },
    disabled: {
        type: Boolean,
        required: true,
        default: false
    }
});
module.exports = mongoose.model('fotor-accounts', AccountSchema)