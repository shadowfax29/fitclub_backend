const mongoose = require("mongoose")
const { Schema, model } = mongoose
const attendanceSchema = new Schema({
    checkIn: Date,
    memberId: { type: Schema.Types.ObjectId, ref: "user" },
    gymId:{type:Schema.Types.ObjectId,ref:"Gym"}
})
const Attendance = model("Attendance", attendanceSchema)
module.exports = Attendance