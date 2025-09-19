require('dotenv').config();
const mongoose = require('mongoose');
// const mongoURI = 'mongodb://127.0.0.1:27017/snti'
// conecting to mongodb
const mongoURI= process.env.MONGO_URI

const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log("connected to mongoose");
    } catch (error) {
        console.log(error);
    }
}

module.exports = connectToMongo