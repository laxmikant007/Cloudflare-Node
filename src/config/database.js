/**
 * Database configuration for Cloudflare D1
 * This provides a simple interface to work with D1 database
 */

let db = null;

/**
 * Initialize the D1 database connection
 * @param {Object} env - Cloudflare environment bindings
 */
export function initializeDatabase(env) {
    if (!env || !env.agenticdb) {
        console.warn('D1 database binding not found. Using mock database for local testing.');
        // For local development without D1, we'll use a mock
        db = createMockDatabase();
    } else {
        console.log('Using Cloudflare D1 database');
        db = env.agenticdb;
        console.log("this is db", db);
    }
    return db;
}

/**
 * Get the current database instance
 */
export function getDatabase() {
    if (!db) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return db;
}

/**
 * Create a mock database for local development
 * This simulates D1's API for testing without actual D1 binding
 */
function createMockDatabase() {
    const mockData = [];
    let nextId = 1;

    return {
        prepare(sql) {
            return {
                bind(...params) {
                    return {
                        async first() {
                            // Simulate SELECT single row
                            if (sql.includes('SELECT') && sql.includes('WHERE')) {
                                const id = params[0];
                                return mockData.find(item => item.id === id) || null;
                            }
                            return null;
                        },
                        async all() {
                            // Simulate SELECT all rows
                            return { results: mockData };
                        },
                        async run() {
                            // Simulate INSERT/UPDATE/DELETE
                            if (sql.includes('INSERT')) {
                                const newItem = {
                                    id: nextId++,
                                    username: params[0],
                                    email: params[1],
                                    phone: params[2],
                                    createdAt: new Date().toISOString(),
                                    updatedAt: new Date().toISOString(),
                                };
                                mockData.push(newItem);
                                return {
                                    success: true,
                                    meta: {
                                        last_row_id: newItem.id,
                                        changes: 1
                                    }
                                };
                            }
                            return { success: true, meta: { changes: 0 } };
                        },
                    };
                },
                async first() {
                    return mockData[0] || null;
                },
                async all() {
                    return { results: mockData };
                },
            };
        },
    };
}

/**
 * Initialize database schema
 * Creates the Users table if it doesn't exist
 */
export async function initializeSchema() {
    const database = getDatabase();

    try {
        const createTableSQL = `
      CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `;

        await database.prepare(createTableSQL).run();
        console.log('Database schema initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing schema:', error);
        // In mock mode, this might fail, but that's okay
        return false;
    }
}

export default {
    initializeDatabase,
    getDatabase,
    initializeSchema,
};
