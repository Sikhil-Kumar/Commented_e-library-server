
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProductSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    crane: {
        type: Number,
        default:0
    },
    pulley: {
        type: Number,
        default:0
    },
    ballbearings: {
        type: Number,
        default:0
    },
    grece: {
        type: Number,
        default:0
    }
});

module.exports = mongoose.model('Product', ProductSchema);


