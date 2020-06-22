const mongoose = require('mongoose');
const bcrypt = require("bcrypt");


const userSchema = mongoose.Schema({
    name: {type: String,
        required: true
    },
    email: {type:
        String,
        required: true
    },
    password: {
        type: String,
        required: true,
        set:  (value) => {
            return bcrypt.hashSync(value, 10);
        },
        select: false
    },
    created_at: {type: Date,
        default: Date.now()
    },
    updated_at: {type: Date,
        default: Date.now()
    }
});

// Update the updated_at field on save
userSchema.pre('save', (next) => {
    this.updated_at = Date.now()
    next()
})

module.exports = mongoose.model('User', userSchema);
