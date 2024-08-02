
const mongoose = require("mongoose")
const { Schema, model } = mongoose
const userSchema = new Schema(
    {
        userName: String,
        email: String,
        role: String,
        mobileNumber: Number,
        password: String,

    }, {
    timestamps: true
}

)
const User = model("User", userSchema)
module.exports = User