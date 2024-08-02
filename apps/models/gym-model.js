const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const gymSchema = new Schema({
    isVerified: { type: Boolean, default: false },
    gymName: String,
    address: String,
    images: [{
        img: String
    }],
    pincode: Number,
    mobile: Number,
    geoLocation: {
        lat: Number,
        lng: Number
    },
    gymOwner: { type: Schema.Types.ObjectId, ref: "User" },
    subscription: [{
        duration: String,
        amount: Number,
        benefits: [String],
        subscriptionType: { type: String, enum: ['basic', 'classic', 'premium'] }
    }],
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    timing: {
        type: Map,
        of: String,
        default: { "mon-sat": "6am-11pm", "sun": "6am-11am" }
    }
});

const Gym = model('Gym', gymSchema);

module.exports = Gym;
