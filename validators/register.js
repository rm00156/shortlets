let validator = require('validator');
let models = require('../models');

const validateCreateUserFields = function (errors, req) {

    if (req.body.name != undefined && !validator.isLength(req.body.name, { min: 3, max: 50 })) {
        errors["name"] = "Please use enter name between 3 and 50 characters in length.";
        console.log("Please use enter name between 3 and 50 characters in length.");
    }

    if (req.body.email != undefined && !validator.isEmail(req.body.email)) {
        errors["email"] = "Please use a valid email address";
        console.log("Please use a valid email address");
    }

    if (req.body.confirmEmail != undefined && req.body.confirmEmail != req.body.email) {
        errors["email"] = "Email addresses don't match";
        console.log("Email addresses don't match");
    }

    if (req.body.password != undefined && !validator.isAscii(req.body.password)) {
        errors["password"] = "Invalid characters in password";
        console.log("Invalid characters in password");
    }
    if (req.body.password != undefined && !validator.isLength(req.body.password, { min: 5, max: 25 })) {
        errors["password"] = "Please ensure that the password length is at least 5 characters long and no more than 25";
        console.log("Please ensure that the password length is at least 5 characters long and no more than 25");
    }

    if (req.body.confirmPassword != undefined && req.body.confirmPassword != req.body.password) {
        errors["password"] = "Passwords don't match";
        console.log("Passwords don't match");
    }
}

exports.validateCreateUserFields = function (errors, req) {
    validateCreateUserFields(errors, req);
}

exports.validateUser = function (errors, req) {
    return new Promise((resolve, reject) => {
        // populates the errors array if any errors found
        validateCreateUserFields(errors, req);
        return models.account.findOne({
            where: {
                'email': req.body.email,
                deleteFl: false
            }
        }).then(async user => {

            if (user !== null) {
                // user already exists
                errors["email"] = "An account with this email already exists. Please log in";
                console.log("An account with this email already exists. Please log in");

            }
            resolve(errors);
        });

    });

}

