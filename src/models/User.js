import { getDatabase } from '../config/database.js';

/**
 * User Model
 * Provides an ORM-like interface for User operations
 */

class User {
    /**
     * Create a new user
     * @param {Object} data - User data { username, email, phone }
     */
    static async create(data) {
        const { username, email, phone } = data;
        const db = getDatabase();

        // Validate required fields
        if (!username || !email || !phone) {
            throw new Error('Missing required fields: username, email, phone');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }

        // Validate phone format
        const phoneRegex = /^[0-9+\-() ]{10,20}$/;
        if (!phoneRegex.test(phone)) {
            throw new Error('Invalid phone number format');
        }

        try {
            const sql = `
        INSERT INTO Users (username, email, phone, createdAt, updatedAt)
        VALUES (?, ?, ?, datetime('now'), datetime('now'))
      `;

            const result = await db
                .prepare(sql)
                .bind(username, email, phone)
                .run();

            // Get the created user
            const userId = result.meta.last_row_id;
            return await this.findById(userId);
        } catch (error) {
            // Handle unique constraint violations
            if (error.message.includes('UNIQUE constraint failed')) {
                if (error.message.includes('username')) {
                    throw new Error('Username already exists');
                }
                if (error.message.includes('email')) {
                    throw new Error('Email already exists');
                }
            }
            throw error;
        }
    }

    /**
     * Find a user by ID
     * @param {number} id - User ID
     */
    static async findById(id) {
        const db = getDatabase();

        console.log("this is db", db);

        const sql = `
      SELECT id, username, email, phone, createdAt, updatedAt
      FROM Users
      WHERE id = ?
    `;

        const user = await db.prepare(sql).bind(id).first();
        return user;
    }

    /**
     * Find all users
     */
    static async findAll() {
        const db = getDatabase();

        const sql = `
      SELECT id, username, email, phone, createdAt, updatedAt
      FROM Users
      ORDER BY createdAt DESC
    `;

        const result = await db.prepare(sql).all();
        return result.results || [];
    }

    /**
     * Find a user by email
     * @param {string} email - User email
     */
    static async findByEmail(email) {
        const db = getDatabase();

        const sql = `
      SELECT id, username, email, phone, createdAt, updatedAt
      FROM Users
      WHERE email = ?
    `;

        const user = await db.prepare(sql).bind(email).first();
        return user;
    }

    /**
     * Find a user by username
     * @param {string} username - Username
     */
    static async findByUsername(username) {
        const db = getDatabase();

        const sql = `
      SELECT id, username, email, phone, createdAt, updatedAt
      FROM Users
      WHERE username = ?
    `;

        const user = await db.prepare(sql).bind(username).first();
        return user;
    }

    /**
     * Update a user
     * @param {number} id - User ID
     * @param {Object} data - Updated data
     */
    static async update(id, data) {
        const db = getDatabase();
        const { username, email, phone } = data;

        const sql = `
      UPDATE Users
      SET username = ?, email = ?, phone = ?, updatedAt = datetime('now')
      WHERE id = ?
    `;

        await db.prepare(sql).bind(username, email, phone, id).run();
        return await this.findById(id);
    }

    /**
     * Delete a user
     * @param {number} id - User ID
     */
    static async delete(id) {
        const db = getDatabase();

        const sql = `DELETE FROM Users WHERE id = ?`;
        const result = await db.prepare(sql).bind(id).run();

        return result.meta.changes > 0;
    }
}

export default User;
