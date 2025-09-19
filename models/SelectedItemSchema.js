const mongoose = require('mongoose');
const { Schema } = mongoose;

const SelectedItemSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    item: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 0
    }
});

module.exports = mongoose.model('SelectedItem', SelectedItemSchema);
