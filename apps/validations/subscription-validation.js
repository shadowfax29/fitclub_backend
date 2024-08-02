

const subscriptionValidation = {

    duration: {
        in: ["body"],
        exists: {
            errorMessage: "Duration is required"
        },
        notEmpty: {
            errorMessage: "Duration should not be empty"
        },
        trim: true
    },
    amount: {
        in: ["body"],
        exists: {
            errorMessage: "Amount is required"
        },
        notEmpty: {
            errorMessage: "Amount should not be empty"
        },
        
        trim: true
    },
    benefits: {
        in: ["body"],
        exists: {
            errorMessage: "Benefits is required"
        },
        notEmpty: {
            errorMessage: "Benefits should not be empty"
        },
        trim: true
    },
    subscriptionType: {
        in: ["body"],
        exists: {
            errorMessage: "Subscription type is required"
        },
        isIn: {
            options: [['basic', 'classic', 'premium']],
            errorMessage: "Invalid subscription type"
        }
    }
    
}

module.exports = subscriptionValidation;
