/**
 * Global error handling middleware
 * Catches and formats errors from the application
 */

/**
 * Error handler middleware
 */
export function errorHandler(err, req, res, next) {
    console.error('Error:', err);

    // Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
        const errors = err.errors.map(e => ({
            field: e.path,
            message: e.message,
        }));

        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors,
        });
    }

    // Sequelize unique constraint errors
    if (err.name === 'SequelizeUniqueConstraintError') {
        const errors = err.errors.map(e => ({
            field: e.path,
            message: `${e.path} already exists`,
        }));

        return res.status(409).json({
            success: false,
            message: 'Duplicate entry',
            errors,
        });
    }

    // Sequelize database errors
    if (err.name === 'SequelizeDatabaseError') {
        return res.status(500).json({
            success: false,
            message: 'Database error',
            error: err.message,
        });
    }

    // Sequelize connection errors
    if (err.name === 'SequelizeConnectionError') {
        return res.status(503).json({
            success: false,
            message: 'Database connection error',
            error: err.message,
        });
    }

    // Generic errors
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path,
    });
}

export default {
    errorHandler,
    notFoundHandler,
};
