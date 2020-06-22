const mongoose = require('mongoose');


const clientSchema = mongoose.Schema({
    name: {type: String,
        required: true
    },
    key: {
        type: String,
        required: true
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
clientSchema.pre('save', (next) => {
    this.updated_at = Date.now()
    next()
})

module.exports = mongoose.model('client', clientSchema);
