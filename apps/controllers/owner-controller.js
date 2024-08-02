const { validationResult } = require("express-validator");
const OwnerProfile = require("../models/ownerprofile-model");
const Gym = require("../models/gym-model");
const cloudinary = require('cloudinary').v2
const jwt = require('jsonwebtoken');
const Attendance = require("../models/attendance-model");
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});
const ownerProfileController = {};

ownerProfileController.single = async (req, res) => {

    try {
        let ownerProfile = await OwnerProfile.findOne({ userId: req.user.id })

        if (!ownerProfile) {
            return res.status(404).json({ message: 'Owner profile not found' });
        }
        const result = await Gym.findOne({ gymOwner: req.user.id });

        if (!result) {
            return res.status(404).json({ message: 'Gym not found' });
        }

        ownerProfile.gym = result._id;
        await ownerProfile.save();
        const populatedResult = await OwnerProfile.findOne({ userId: req.user.id }).populate('gym')
            .populate('userId');


        res.status(200).json(populatedResult);
    } catch (err) {
        res.status(500).json(err);
    }
};

ownerProfileController.add = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // const result = await cloudinary.uploader.upload(req.file.path);
        const body = req.body;
        // body.profilePhoto=result.secure_url
        body.userId = req.user.id
        const gym = await Gym.findOne({ gymOwner: req.user.id })
        if (gym) {
            body.gym = gym._id
        }

        await OwnerProfile.create(body)
        res.status(201).json("Added successfully");
    } catch (err) {
        res.status(500).json(err);
    }
};
ownerProfileController.update = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const result = await cloudinary.uploader.upload(req.file.path);
        const body = req.body;
        body.profilePhoto = result.secure_url
        const ownerProfile = await OwnerProfile.findOneAndUpdate({ userId: req.user.id }, body, { new: true })
        res.status(200).json(ownerProfile);
    }
    catch (err) {
        res.status(500).json(err);
    }
}
ownerProfileController.validate = async (req, res) => {
    const { token } = req.body;
    const result=await Gym.findOne({gymOwner:req.user.id})

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        

        if (decoded.gymId === result._id.toString()) {
            const attendance={
                gymId:decoded.gymId,
                memberId:decoded.userId,
                checkIn:decoded.timeStamp
            }
            const attendanceResult=await Attendance.create(attendance)
            
            return res.json(true);
        } else {
            
            return res.json(false);
        }
    } catch (err) {
        console.error('Error decoding token:', err);
        return res.json('Invalid or expired QR code');
    }

}


module.exports = ownerProfileController;