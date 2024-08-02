
const mongoose = require("mongoose")
const { Schema, model } = mongoose
const ownerProfileSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    gym: { type: Schema.Types.ObjectId, ref: "Gym" }
}, {
    timestamps: true
})
const OwnerProfile = model("OwnerProfile", ownerProfileSchema)
module.exports = OwnerProfile