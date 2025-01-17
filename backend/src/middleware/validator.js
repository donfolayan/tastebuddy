const { validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

const validate = validations => {
    return async (req, res, next) => {
        // Run all validations
        await Promise.all(validations.map(validation => validation.run(req)));

        // Check for validation errors
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        // If there are errors, format them and throw an error
        const extractedErrors = errors.array().map(err => err.msg);
        throw new AppError(extractedErrors[0], 400);
    };
};

module.exports = validate; 