const mongoose = require("mongoose")
const MemberProfile = require("./memberprofile-model")
const { Schema, model } = mongoose
const workoutScheduleSchema = new Schema({
    workout: {
        type: String,
        required: true,
        trim: true,
       },
    date: {
        type: String,
        

        
    },
    duration: {
        type: String,
        required: true,
        trim: true,
    },
    note: {
        type: String,
        trim: true,
    },
   
    memberId: { type: Schema.Types.ObjectId, ref: "MemberProfile" }
})
const WorkoutSchedule = model("workoutSchedule", workoutScheduleSchema)
module.exports = WorkoutSchedule