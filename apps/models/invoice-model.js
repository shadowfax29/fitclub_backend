const mongoose = require("mongoose")
const { Schema, model } = mongoose
const invoiceSchema = new Schema({
    memberId: { type: Schema.Types.ObjectId, ref: "User" },
    transactionId: String,
    gymId: { type: Schema.Types.ObjectId, ref: "Gym" },
    subscriptionId: String,
    duration: String,
    start: String,
    end: String,
    amount: Number,
    paymentType: String,
    status: String

})
const Invoice = model("Invoice", invoiceSchema)
module.exports = Invoice