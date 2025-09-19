const mongoose = require('mongoose');

const { Schema } = mongoose;

const ServiceProviderSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: String,
        default: Date.now
    }
});
const ServiceProvider = mongoose.model('serviceprovider', ServiceProviderSchema)

module.exports = ServiceProvider