import express from 'express';
import User from '../models/User.js';
import { validateUserData } from '../middleware/validator.js';

const router = express.Router();

/**
 * POST /user/add
 * Create a new user
 * Body: { username, email, phone }
 */
router.post('/add', validateUserData, async (req, res, next) => {
    try {
        const { username, email, phone } = req.body;

        // Create new user
        const user = await User.create({
            username: username.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: user,
        });
    } catch (error) {
        // Handle specific errors
        if (error.message.includes('already exists')) {
            return res.status(409).json({
                success: false,
                message: error.message,
            });
        }
        next(error);
    }
});

/**
 * GET /user/:id
 * Get user details by ID
 */
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        console.log("this is id", id);

        // Validate ID is a number
        if (isNaN(id) || parseInt(id) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID',
            });
        }

        // Find user by ID
        const user = await User.findById(parseInt(id));

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /user
 * Get all users
 */
router.get('/', async (req, res, next) => {
    try {
        const users = await User.findAll();

        res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
