const { validationResult } = require("express-validator");
const Gym = require("../models/gym-model");
const nodemailer = require("nodemailer");
const MemberProfile = require("../models/memberprofile-model");
const Invoice = require("../models/invoice-model");
const cloudinary = require('cloudinary').v2
const fs = require('fs');
const path = require('path');
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});
const gymController = {}
gymController.add = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const body = req.body

        body.gymOwner = req.user.id
        body.timing = { "mon_fri": "6am-11pm", "sat_sun": "7am-12pm" }
        console.log(body)
        const result = await Gym.create(body)

        res.status(201).json(result)
    }
    catch (err) {
        res.status(500).json(err.message)
    }
}

gymController.update = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const body = req.body
        const gymId = req.params.gymId
        const updated = await Gym.findByIdAndUpdate(gymId, body, { new: true })
        res.status(200).json(updated)
    }
    catch (err) {
        res.status(500).json(err.message)
    }
}
gymController.delete = async (req, res) => {
    try {
        const gymId = req.params.id
        await Gym.findByIdAndDelete(gymId)
        res.status(200).json("gym deleted successfully")
    }
    catch (err) {
        res.status(500).json(err.message)
    }
}
gymController.all = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const gyms = await Gym.find({ isVerified: true })
            .skip(skip)
            .limit(limit);

        const totalGyms = await Gym.countDocuments({ isVerified: true });

        res.status(200).json({ gyms, totalGyms });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

gymController.adminView = async (req, res) => {

    const { search = '', sort = 'asc', page = 1, limit = 10 } = req.query;

    const query = { gymName: { $regex: search, $options: 'i' } };
    const sortOrder = sort === 'asc' ? 1 : -1;

    const gyms = await Gym.find(query)
        .sort({ gymName: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit);

    const totalGyms = await Gym.countDocuments(query);
    const totalPages = Math.ceil(totalGyms / limit);

    res.json({ gyms, totalPages });


}
gymController.approval = async (req, res) => {
    try {
        const gymId = req.params.gymId
        const gym = await Gym.findByIdAndUpdate(gymId, { isVerified: true }, { new: true })
        res.status(200).json(gym)
    }
    catch (err) {
        res.status(500).json(err.message)
    }
}
gymController.reject = async (req, res) => {
    try {
        const gymId = req.params.gymId
        const gym = await Gym.findByIdAndUpdate(gymId, { isVerified: false }, { new: true })
        res.status(200).json(gym)
    }
    catch (err) {
        res.status(500).json(err.message)
    }
}
gymController.single = async (req, res) => {
    try {
        const gym = await Gym.findOne({ gymOwner: req.user.id }).populate("gymOwner").populate("members")
        res.status(200).json(gym)
    }
    catch (err) {
        res.status(500).json(err.message)
    }
}
gymController.detail = async (req, res) => {
    try {
        const gym = await Gym.findOne({ _id: req.params.gymId })
        res.status(200).json(gym)
    }
    catch (err) {
        res.status(500).json(err)
    }
}
gymController.addSubscription = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const gymId = req.params.gymId;
        const newSubscription = req.body;


        const gym = await Gym.findById(gymId);

        if (gym) {
            gym.subscription.push(newSubscription);
            await gym.save();
            res.status(200).json(gym);
        } else {
            res.status(404).json({ message: "Gym not found" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
gymController.updateSubscription = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const gymId = req.params.gymId;
        const subId = req.params.subId;
        const updatedSubscription = req.body;
        // const updatedGym = await Gym.findOneAndUpdate(
        //     { _id: gymId, "subscription._id": subId },
        //     { $set: { "subscription.$": updatedSubscription } },
        //     { new: true }
        // );
        const gym = await Gym.findById(gymId)
        if(!gym){
            return res.status(404).json({ message: "Gym not found" });
        }
        const subscription = gym.subscription.id(subId);
        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }

        // Update the subscription fields
        subscription.duration = updatedSubscription.duration 
        subscription.amount = updatedSubscription.amount 
        subscription.benefits = updatedSubscription.benefits 
        subscription.subscriptionType = updatedSubscription.subscriptionType 

        // Save the gym document
        await gym.save();

        res.status(200).json({ message: "Subscription updated successfully", gym: gym });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
gymController.deleteSubscription = async (req, res) => {
    try {
        const gymId = req.params.gymId;
        const subId = req.params.subId;
        const gym = await Gym.findById(gymId);

        if (gym) {

            gym.subscription = gym.subscription.filter((ele) => ele._id.toString() !== subId);


            await gym.save();

            res.status(200).json({ message: "Subscription deleted successfully", gym });
        } else {
            res.status(404).json({ message: "Gym not found" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

gymController.addGymImage = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const gymId = req.params.gymId;
        const gym = await Gym.findById(gymId);

        if (!gym) {
            return res.status(404).json({ message: "Gym not found" });
        }

        const imageUploads = req.files.map(file => cloudinary.uploader.upload(file.path));
        const uploadResults = await Promise.all(imageUploads);
        const imageUrls = uploadResults.map(result => ({ img: result.secure_url }));

        gym.images.push(...imageUrls);
        await gym.save();

        res.status(201).json({ images: imageUrls });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
gymController.updateGymImage = async (req, res) => {
    try {
        const gymId = req.params.gymId;
        const imgId = req.params.imgId
        const result = await cloudinary.uploader.upload(req.file.path);
        const gym = await Gym.findById(gymId);

        if (!gym) {
            return res.status(404).json({ message: "Gym not found" });
        }


        const imageIndex = gym.images.findIndex(img => img._id.toString() === imgId);
        if (imageIndex === -1) {
            return res.status(404).json({ message: "Image not found" });
        }

        gym.images[imageIndex].img = result.secure_url;

        await gym.save();

        res.status(200).json(gym.images[imageIndex].img);
    }
    catch (err) {
        res.status(500).json({ error: err.message })
    }
}
gymController.deleteGymImage = async (req, res) => {
    try {
        const gymId = req.params.gymId;

        const gym = await Gym.findById(gymId);
        if (!gym) {
            return res.status(404).json({ message: "Gym not found" })
        }
        // const imageIndex = gym.images.findIndex(img => img._id.toString() === imgId);
        // if (imageIndex === -1) {
        //     return res.status(404).json({ message: "Image not found" });
        // }
        // gym.images.splice(imageIndex, 1);
        // await gym.save();
        gym.images = [];
        await gym.save();

        res.status(200).json([]);

    }
    catch (err) {
        res.status(500).json({ error: err.message })
    }
}
gymController.announce = async (req, res) => {
    try {
        const templatePath = path.join(__dirname, '../../announcementTemplate.html');
        let template = fs.readFileSync(templatePath, 'utf8');

        const logoPath = path.join(__dirname, '../../images/Screenshot 2024-07-12 185824.png');
        template = template.replace('{{title}}', req.body.title);
        template = template.replace('{{content}}', req.body.content);

        const mems = await Gym.findOne({ gymOwner: req.user.id }).populate("members")

        if (!mems) {
            return res.json("gym not found")
        }
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "ravi.kumargowda2429@gmail.com",
                pass: "gatp blle kcoc ztnc",
            },
        });
        const mailOptions = {
            from: "ravi.kumargowda2429@gmail.com",
            to: mems.members.map((ele) => ele.email).join(','),
            subject: "FITCLUB ANNOUNCEMENT",
            html: template,
            
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
            else {
                res.status(200).json({ message: "password reset link sent to your email" })
            }
        })



    }
    catch (err) {
        res.status(500).json({ error: err.message })
    }
}
gymController.gymMembers = async (req, res) => {
    try {
        const id = await Gym.findOne({ gymOwner: req.user.id })
        if (!id) {
            return res.json("gym not found")
        }
        const invoiceresult = await Invoice.find({ gymId: id._id }).populate("memberId")
       
        const memberProfiles = await MemberProfile.find({
            userId: { $in: id.members }
        });

        // Count male and female members
        const counts = memberProfiles.reduce(
            (acc, profile) => {
                if (profile.gender === 'Male') {
                    acc.maleCount++;
                } else if (profile.gender === 'Female') {
                    acc.femaleCount++;
                }
                return acc;
            },
            { maleCount: 0, femaleCount: 0 }
        );

        res.json({
            totalMale: counts.maleCount,
            totalFemale: counts.femaleCount,
            invoiceresult:invoiceresult
        });

    }
    catch (err) {
        res.status(500).json(err)
    }
}
gymController.gender=async(req,res)=>{
    try{
        const gym = await Gym.findOne({ gymOwner: req.user.id }).populate("members")
        if (!gym) {
            return res.json("gym not found")
        }
        const memberProfiles = await MemberProfile.find({
            userId: { $in: gym.members }
        });

        // Count male and female members
        const counts = memberProfiles.reduce(
            (acc, profile) => {
                if (profile.gender === 'Male') {
                    acc.maleCount++;
                } else if (profile.gender === 'Female') {
                    acc.femaleCount++;
                }
                return acc;
            },
            { maleCount: 0, femaleCount: 0 }
        );

        res.json({
            totalMale: counts.maleCount,
            totalFemale: counts.femaleCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = gymController