const mongoose = require('mongoose');
const { Schema } = mongoose;

const ItemSchema = new Schema({
    // admin: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'serviceprovider',
    //     required: true
    // },
    items: {
        type: Map,
        of: Number
    }
});

module.exports = mongoose.model('Item', ItemSchema);
