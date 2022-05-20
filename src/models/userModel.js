const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true,
    enum: ["Mr", "Mrs", "Miss"],
  
        
 },

    name: {
        type: String,
        required: true,
        trim: true,
    },

    phone: {
        type: Number,
        required: true,
        match: [/^([+]\d{10})?\d{15}$/, "Enter 10 Digit Valid Mobile Number"],
        unique: true


    },

    email: {
        type: String,
        required: true,
        trim:true,
        match: [/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/, 'Please fill a valid email address'],
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true,
        minLen: 8,
        maxLen: 15
    },

    address: {
        street: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            trim: true
        },
        pincode: {
            type: String,
            trim: true
        },
    },
},
    { timestamps: true }
)

module.exports = mongoose.model("User", UserSchema)