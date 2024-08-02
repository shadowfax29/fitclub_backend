const mongoose = require("mongoose")
const { Schema, model } = mongoose
const memberProfileSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    profilePhoto: String,
    height: String,
    gender: String,
    weight: String,
    active:{type:Boolean,default:false},
    invoiceId:{type:Schema.Types.ObjectId, ref: "Invoice"}

})
const memberProfile = model("memberProfile", memberProfileSchema)
module.exports = memberProfile