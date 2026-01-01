import { initializeDatabase, initializeSchema } from '../config/database.js';
import User from './User.js';

/**
 * Initialize all models
 * @param {Object} env - Cloudflare environment bindings
 */
export async function initializeModels(env = null) {
    // Initialize database connection
    initializeDatabase(env);

    // Initialize schema (create tables if they don't exist)
    await initializeSchema();

    return {
        User,
    };
}

/**
 * Get all models
 */
export function getModels() {
    return {
        User,
    };
}

export default {
    initializeModels,
    getModels,
};
