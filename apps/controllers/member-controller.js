const { validationResult } = require("express-validator");
const Member = require("../models/memberprofile-model");
const jwt = require("jsonwebtoken")
const QRCode = require('qrcode')
const WorkoutSchedule = require("../models/workoutSchedule-model");
const Gym = require("../models/gym-model");
const invoice = require("../models/invoice-model");
const memberProfile = require("../models/memberprofile-model");
const cloudinary = require('cloudinary').v2;
const memberProfileController = {};

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

// Single Member Profile
memberProfileController.single = async (req, res) => {
    try {
        const member = await Member.findOne({ userId: req.params.id }).populate("userId").populate("gym");
        res.status(200).json(member);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add Member Profile
memberProfileController.add = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const result = await cloudinary.uploader.upload(req.file.path);
        const body = req.body;
        body.profilePhoto = result.secure_url;
        body.userId = req.user.id;

        const member = await Member.create(body);
        res.status(201).json(member);
    } catch (err) {
        res.status(500).json({ error: err });
    }
};

// Update Member Profile
memberProfileController.update = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        let result
        if (req.file) {

            result = await cloudinary.uploader.upload(req.file.path);
        }
        const body = req.body;
        if (result) {

            body.profilePhoto = result.secure_url;
        }

        const member = await Member.findOneAndUpdate({ userId: req.params.id }, body, { new: true });
        res.status(200).json(member);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get All Members
memberProfileController.all = async (req, res) => {
    try {
        const members = await Member.find().populate("userId");
        res.status(200).json(members);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
//add workout
memberProfileController.addWorkout = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const body = req.body;
        body.memberId = req.user.id
        body.date = new Date(body.date)
        const workout = await WorkoutSchedule.create(body)
        // console.log(workout)
        res.json(workout)
    }
    catch (err) {
        res.status(500).json(err);
    }
}
memberProfileController.getWorkout = async (req, res) => {
    try {

        const workout = await WorkoutSchedule.find({ memberId: req.user.id })
        res.json(workout)
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
memberProfileController.deleteWorkout = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const workout = await WorkoutSchedule.findByIdAndDelete(req.params.id)
    }
    catch (err) {
        res.status(500).json({ error: err.message })
    }
}
memberProfileController.generateQr = async (req, res) => {
    try {
        // Find the gym associated with the current user
        const gym = await Gym.findOne({ members: { $in: [req.user.id] } });

        if (!gym) {
            return res.status(404).json({ error: 'Gym not found' });
        }

        // Find the invoice associated with the current user
        const gymdate = await invoice.findOne({ memberId: req.user.id });

        if (!gymdate) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        const today = new Date();
        const startDate = new Date(gymdate.start);
        const endDate = new Date(gymdate.end);
        if (today.toISOString().split('T')[0] >= startDate.toISOString().split('T')[0]) {
            const payload = {
                userId: req.user.id,
                gymId: gym._id,
                timeStamp: Date.now()
            };

            const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '5s' });

            QRCode.toDataURL(token, (err, url) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to generate QR code' });
                }
                res.json({ qrCode: url });
            });
        } else if (today > endDate) {
            // Delete the invoice and member profile
            const deletedInvoice = await invoice.findOneAndDelete({ memberId: req.user.id });
            const deletedMember = await memberProfile.findOne({ userId: req.user.id });
            deletedMember.active = false

            await deletedMember.save()
            await deletedInvoice.save()

            // Remove the user ID from the gym's members array
            await Gym.updateOne(
                { _id: gym._id },
                { $pull: { members: req.user.id } }
            );

            res.status(200).json({ message: 'Membership expired ' });
        } else {
            res.status(400).json({ error: 'QR code generation is not allowed before the start date' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = memberProfileController;
