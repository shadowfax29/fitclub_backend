const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;
const db = require("./config/database");
const { checkSchema } = require("express-validator");

app.use(express.json());
app.use(cors());
// Controllers
const userController = require("./apps/controllers/user-controller");
const memberProfileController = require("./apps/controllers/member-controller");
const ownerProfileController = require("./apps/controllers/owner-controller");
const gymController = require("./apps/controllers/gym-controller");
const attendanceController = require("./apps/controllers/attendance-controller");
const User = require("./apps/models/users-model");

// Middleware
const authenticateUser = require("./apps/middleware/authenticateUser");
const authorizeUser = require("./apps/middleware/authorization");

// Validations
const userRegisterValidation = require("./apps/validations/user-Validation").userRegisterValidation;
const userLoginValidation = require("./apps/validations/user-Validation").userLoginValidation;
const userForgotValidation = require("./apps/validations/user-Validation").userForgotValidation;
const userResetValidation = require("./apps/validations/user-Validation").userResetValidation;
const memberProfileValidation = require("./apps/validations/memberProfile-validation");
const { gymValidation, gymImageValidation, gymUpdateValidation } = require("./apps/validations/gym-validation");
const subscriptionValidation = require("./apps/validations/subscription-validation");
const paymentController = require("./apps/controllers/payment-controller");

// Database connection
db();

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, uniqueSuffix);
    }
});

const upload = multer({ storage: storage });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get("/userCount", async (req, res) => {
    try {
        const result = await User.countDocuments();
        res.json(result);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

// User Routes
app.post("/user/register", checkSchema(userRegisterValidation), userController.register);
app.post("/user/login", checkSchema(userLoginValidation), userController.login);
app.post("/user/forgotPassword", checkSchema(userForgotValidation), userController.forgotPassword);
app.put("/user/resetPassword/:userId", checkSchema(userResetValidation), userController.resetPassword);

// Member Profile Routes
app.post("/user/memberProfile", authenticateUser, authorizeUser(["Member"]), upload.single("profilePhoto"), checkSchema(memberProfileValidation), memberProfileController.add);
app.get("/user/memberProfile/:id", authenticateUser, authorizeUser(["Member"]), memberProfileController.single);
app.get("/user/members", memberProfileController.all);
app.put("/user/memberProfile/:id", authenticateUser, authorizeUser(["Member"]), upload.single("profilePhoto"), checkSchema(memberProfileValidation), memberProfileController.update);
app.post("/user/workoutSchedule",authenticateUser,authorizeUser(["Member"]),memberProfileController.addWorkout)
app.get("/user/workoutSchedule",authenticateUser,authorizeUser(["Member"]),memberProfileController.getWorkout)
app.delete("/user/workoutSchedule/:id",authenticateUser,authorizeUser(["Member"]),memberProfileController.deleteWorkout)
app.get("/user/generateQr",authenticateUser,authorizeUser(["Member"]),memberProfileController.generateQr)
app.get("/user/gyms",authenticateUser,authorizeUser(["Member"]),gymController.all)
app.get("/user/gymDetail/:gymId",authenticateUser,authorizeUser(["Member"]),gymController.detail)
app.post("/checkout",authenticateUser,authorizeUser(["Member"]),paymentController.pay)
app.put("/paymentDetail/:id",authenticateUser,authorizeUser(["Member"]),paymentController.status)
app.get("/planDetail",authenticateUser,authorizeUser(["Member"]),paymentController.getPlan)
// Owner Profile Routes
app.post("/user/ownerProfile", authenticateUser, authorizeUser(["Owner"]), ownerProfileController.add);
app.get("/user/ownerProfile", authenticateUser, authorizeUser(["Owner"]), ownerProfileController.single);
// app.put("/user/ownerProfile", authenticateUser, authorizeUser(["Owner"]), upload.single("profilePhoto"), ownerProfileController.update);
app.post('/validate-qr',authenticateUser, authorizeUser(["Owner"]),ownerProfileController.validate);
// Gym Routes
app.post("/gym/addGym", authenticateUser, authorizeUser(["Owner"]), checkSchema(gymValidation), gymController.add);
app.get("/gym/myGym", authenticateUser, authorizeUser(["Owner"]), gymController.single);
app.get("/gymMembers", authenticateUser, authorizeUser(["Owner"]),gymController.gymMembers);
app.put("/gym/updateGymDetail/:gymId", authenticateUser, authorizeUser(["Owner"]), checkSchema(gymUpdateValidation), gymController.update);
app.delete("/gym/deleteGym", authenticateUser, authorizeUser(["Owner"]), gymController.delete);
app.post("/announcement",authenticateUser,authorizeUser(["Owner"]),gymController.announce)
app.get("/gender",authenticateUser,authorizeUser(["Owner"]),gymController.gender)
//subscription
app.post("/gym/addSubscription/:gymId", authenticateUser, authorizeUser(["Owner"]), checkSchema(subscriptionValidation), gymController.addSubscription);
app.put("/gym/updateSubscription/:gymId/:subId", authenticateUser, authorizeUser(["Owner"]), gymController.updateSubscription);
app.delete("/gym/deleteSubscription/:gymId/:subId", authenticateUser, authorizeUser(["Owner"]), gymController.deleteSubscription);
//images
app.post("/gym/addImage/:gymId", authenticateUser, authorizeUser(["Owner"]),upload.array("images"), checkSchema(gymImageValidation), gymController.addGymImage);
app.put("/gym/updateImage/:gymId/:imgId", authenticateUser, authorizeUser(["Owner"]), upload.single("images"),checkSchema(gymImageValidation), gymController.updateGymImage);
app.delete("/gym/deleteImage/:gymId", authenticateUser, authorizeUser(["Owner"]), gymController.deleteGymImage);

// Attendance Routes
app.get("/attendance", authenticateUser, authorizeUser(["Member"]), attendanceController.all);

// Admin Routes
app.put("/admin/approval/:gymId", authenticateUser, authorizeUser(["Admin"]), gymController.approval);
app.put("/admin/reject/:gymId", authenticateUser, authorizeUser(["Admin"]), gymController.reject);
app.get("/admin/gymList", authenticateUser, authorizeUser(["Admin"]), gymController.adminView);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
