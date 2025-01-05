const { validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

const validate = validations => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        const extractedErrors = errors.array().map(err => err.msg);
        throw new AppError(extractedErrors[0], 400);
    };
};

module.exports = validate; 
