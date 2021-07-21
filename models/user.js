const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema ({
    name_first: {
        type: String,
        required: true,
    },
    name_last: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        //look into more verification(possibly through mongoose) either with regex
    },
    password: {
        type: String,
        required: true,
    }
})

const User = mongoose.model('User', UserSchema);

module.exports = User