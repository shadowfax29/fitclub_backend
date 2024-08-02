
const memberProfileValidation={
    
    height:{
        in:["body"],
        exists:{
            errorMessage:"Height field is required",
            bail:true
        },
        notEmpty:{
            errorMessage:"height should not be empty"
        },
    },
    weight:{
        in:["body"],
        exists:{
            errorMessage:"Weight field is required",
            bail:true
        },
        notEmpty:{
            errorMessage:"weight should not be empty"
        },
    },
    gender:{
        in:["body"],
        exists:{
            errorMessage:"Gender field is required",
            bail:true
        },
        notEmpty:{
            errorMessage:"gender should not be empty"
        },
        isIn: {
            options: [["Male", "Female","Others"]],
            errorMessage: "gender should be one of the following: male, female,others",
        },
    },
   
    
}
module.exports=memberProfileValidation