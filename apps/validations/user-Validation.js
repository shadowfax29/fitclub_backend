const User = require("../models/users-model");
const validator=require("express-validator")
const userRegisterValidation = {
    userName: {
        in: ["body"],
        exists:{
            errorMessage: "name field is required",
            bail:true
        },
        notEmpty: {
            errorMessage: "Name should not be empty",
        },
        trim: true,
    },
    email: {
        in: ["body"],
        exists:{
            errorMessage: "email field is required",
            bail:true
        },
        notEmpty: {
            errorMessage: "Email should not be empty",
        },
        isEmail: {
            errorMessage: "Email is not valid",
        },
        trim: true,
        normalizeEmail: true,
        custom: {
            options: async (value) => {
                const user = await User.findOne({ email: value });
                if (user) {
                    throw new Error("Email already registered");
                }
                return true;
            },
        },
    },
    role: {
        in: ["body"],
        exists:{
            errorMessage: "role field is required",
            bail:true
        },
        notEmpty: {
            errorMessage: "Role should not be empty",
        },
        isIn: {
            options: [["Owner", "Member","Admin"]],
            errorMessage: "Role should be one of the following: GymOwner, GymUser",
        },
        trim:true,
    },
    mobileNumber: {
        in: ["body"],
        exists:{
            errorMessage: "mobileNumber field is required",
            bail:true
        },
        notEmpty: {
            errorMessage: "Mobile number should not be empty",
        },
        isMobilePhone: {
            errorMessage: "Mobile number is not valid",
        },
        trim: true,
        custom: {
            options: async (value) => {
                const user = await User.findOne({ mobileNumber: value });
                if (user) {
                    throw new Error("This phone number is already registered");
                }
                return true;
            },
        },
    },
    password: {
        in: ["body"],
        exists:{
            errorMessage: "password field is required",
            bail:true
        },
        notEmpty: {
            errorMessage: "Password should not be empty",
        },
        isLength: {
            options: { min: 8, max: 16 },
            errorMessage: "Password length should be 8 - 16 characters",
        },
        trim: true,
    },
};

const userLoginValidation = {
    email: {
        in: ["body"],
        exists:{
            errorMessage: "email field is required",
            bail:true
        },
        notEmpty: {
            errorMessage: "Email should not be empty",
        },
        isEmail: {
            errorMessage: "Email is not valid",
        },
        trim: true,
        normalizeEmail: true,
       
    },
    password: {
        in: ["body"],
        exists:{
            errorMessage: "password field is required",
            bail:true
        },
        notEmpty: {
            errorMessage: "Password should not be empty",
        },
        isLength: {
            options: { min: 8, max: 16 },
            errorMessage: "Password length should be 8 - 16 characters",
        },
        trim: true,
    },
};
const userForgotValidation = {
    email: {
        in: ["body"],
        exists:{
            errorMessage: "email field is required",
            bail:true
        },
        notEmpty: {
            errorMessage: "Email should not be empty",
        },
        isEmail: {
            errorMessage: "Email is not valid",
        },
        trim: true,
        normalizeEmail: true,
    }
  
};
const userResetValidation = {
    password: {
        in: ["body"],
        exists:{
            errorMessage: "password field is required",
            bail:true
        },
        notEmpty: {
            errorMessage: "Password should not be empty",
        },
        isLength: {
            options: { min: 8, max: 16 },
            errorMessage: "Password length should be 8 - 16 characters",
        },
        trim: true,
    },
}

module.exports = { userRegisterValidation, userLoginValidation,userForgotValidation ,userResetValidation};
