const validateSignup = (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;
    const errors = {};

    // Validate first name
    if (!firstName || firstName.trim() === '') {
        errors.firstName = 'First name is required';
    } else if (firstName.length < 2) {
        errors.firstName = 'First name should be at least 2 characters long';
    }

    // Validate last name
    if (!lastName || lastName.trim() === '') {
        errors.lastName = 'Last name is required';
    } else if (lastName.length < 2) {
        errors.lastName = 'Last name should be at least 2 characters long';
    }

    // Validate email
    if (!email || email.trim() === '') {
        errors.email = 'Email is required';
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.email = 'Please enter a valid email address';
        }
    }

    // Validate password
    if (!password) {
        errors.password = 'Password is required';
    } else if (password.length < 6) {
        errors.password = 'Password should be at least 6 characters long';
    }

    // Return errors if any
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = {};

    // Validate email
    if (!email || email.trim() === '') {
        errors.email = 'Email is required';
    }

    // Validate password
    if (!password) {
        errors.password = 'Password is required';
    }

    // Return errors if any
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

module.exports = {
    validateSignup,
    validateLogin
};
