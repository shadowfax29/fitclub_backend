const Attendance = require("../models/attendance-model")

const attendanceController = {}
// attendanceController.checkIn = async (req, res) => {
//     try {

//         const body = req.body
//         body.gymId = req.params.gymId
//         body.memId = req.params.memId
//         await Attendance.create(body)
//         res.status(200).json({ message: "Attendance Checked In Successfully" })
//     }
//     catch (err) {
//         res.status(500).json({ message: err.message })
//     }
// }
attendanceController.all = async (req, res) => {
    try {

        const attendance = await Attendance.find({ memberId: req.user.id })
        res.status(200).json(attendance)
       
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }

}
module.exports = attendanceController