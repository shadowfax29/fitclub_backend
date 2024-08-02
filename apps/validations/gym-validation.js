const Gym = require("../models/gym-model");

const gymValidation={
   
    gymName:{
        in:["body"],
        exists:{
            errorMessage:"gym name is required"
        },
        notEmpty:{
            errorMessage:"gym name should not be empty"
        },
        trim:true
    },
    address:{
        in:["body"],
        exists:{
            errorMessage:"address is required"
        },
        notEmpty:{
            errorMessage:"address should not be empty"
        },
        trim:true
    },
    
    pincode:{
        in:["body"],
        exists:{
            errorMessage:"pincode is required"
        },
        notEmpty:{
            errorMessage:"pincode should not be empty"
        },
        isNumeric:{
            errorMessage:"pincode should be numeric"
        },
        trim:true
    },
    mobile:{
        in:["body"],
        exists:{
            errorMessage:"mobile is required"
        },  
        notEmpty:{
            errorMessage:"mobile should not be empty"
        },
        isMobilePhone: {
            errorMessage: "Mobile number is not valid",
        },
        trim:true,
        custom: {
            options: async (value) => {
                const user = await Gym.findOne({ mobile: value });
                if (user) {
                    throw new Error("This phone number is already registered");
                }
                return true;
            },
        },
    }
}
const gymUpdateValidation={
   
    gymName:{
        in:["body"],
        exists:{
            errorMessage:"gym name is required"
        },
        notEmpty:{
            errorMessage:"gym name should not be empty"
        },
        trim:true
    },
    address:{
        in:["body"],
        exists:{
            errorMessage:"address is required"
        },
        notEmpty:{
            errorMessage:"address should not be empty"
        },
        trim:true
    },
    
    pincode:{
        in:["body"],
        exists:{
            errorMessage:"pincode is required"
        },
        notEmpty:{
            errorMessage:"pincode should not be empty"
        },
        isNumeric:{
            errorMessage:"pincode should be numeric"
        },
        trim:true
    },
    mobile:{
        in:["body"],
        exists:{
            errorMessage:"mobile is required"
        },  
        notEmpty:{
            errorMessage:"mobile should not be empty"
        },
        isMobilePhone: {
            errorMessage: "Mobile number is not valid",
        },
        trim:true,
       
    }
}
const gymImageValidation = {
    images: {
      custom: {
        options: (value, { req }) => {
          if (!req.files || req.files.length === 0) {
            throw new Error('Images are required');
          }
          return true;
        }
      }
    }
  }
module.exports={gymValidation,gymImageValidation,gymUpdateValidation}