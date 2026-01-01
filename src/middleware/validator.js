/**
 * Input validation middleware for user data
 */

/**
 * Validate email format
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone) {
    const phoneRegex = /^[0-9+\-() ]{10,20}$/;
    return phoneRegex.test(phone);
}

/**
 * Middleware to validate user creation data
 */
export function validateUserData(req, res, next) {
    const { username, email, phone } = req.body;
    const errors = [];

    // Validate username
    if (!username || username.trim() === '') {
        errors.push({ field: 'username', message: 'Username is required' });
    } else if (username.length < 3 || username.length > 50) {
        errors.push({ field: 'username', message: 'Username must be between 3 and 50 characters' });
    }

    // Validate email
    if (!email || email.trim() === '') {
        errors.push({ field: 'email', message: 'Email is required' });
    } else if (!isValidEmail(email)) {
        errors.push({ field: 'email', message: 'Please provide a valid email address' });
    }

    // Validate phone
    if (!phone || phone.trim() === '') {
        errors.push({ field: 'phone', message: 'Phone number is required' });
    } else if (!isValidPhone(phone)) {
        errors.push({ field: 'phone', message: 'Please provide a valid phone number (10-20 digits)' });
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors,
        });
    }

    // Validation passed, proceed to next middleware
    next();
}

export default {
    validateUserData,
    isValidEmail,
    isValidPhone,
};
