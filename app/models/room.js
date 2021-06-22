const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const crypto = require('crypto');


const roomSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    key: {
        type: String,
        required: true,
        default: () => crypto.randomBytes(10).toString('hex'),
        unique: true
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date,
        default: Date.now()
    }
});

// Update the updated_at field on save
roomSchema.pre('save', (next) => {
    this.updated_at = Date.now()
    next()
})

module.exports = mongoose.model('Room', roomSchema);
