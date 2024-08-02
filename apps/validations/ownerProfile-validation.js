const ownerProfileValidation = {
    profilePhoto:{
        in:["body"],
        exists: {
            errorMessage: "photo is required"
        },
        notEmpty: {
            errorMessage: "photo should not be empty"
        },
        trim: true
    }
};

module.exports = ownerProfileValidation;
