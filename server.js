import { httpServerHandler } from 'cloudflare:node';
import express from 'express';
import { initializeModels } from './src/models/index.js';
import userRoutes from './src/routes/userRoutes.js';
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.js';

const app = express();

// Store environment globally for model access
let globalEnv = null;
let initialized = false;

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Initialize database middleware
app.use(async (req, res, next) => {
  if (globalEnv && !initialized) {
    try {
      console.log('Initializing database...');
      await initializeModels(globalEnv);
      initialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }
  next();
});

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Express.js + D1 Database running on Cloudflare Workers!',
    version: '1.0.0',
    endpoints: {
      'POST /user/add': 'Create a new user (body: { username, email, phone })',
      'GET /user/:id': 'Get user by ID',
      'GET /user': 'Get all users',
    },
  });
});

// API Routes
app.use('/user', userRoutes);

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Error handling middleware - must be last
app.use(errorHandler);

// Start Express server
app.listen(3000);

// Export handler for Cloudflare Workers
export default {
  async fetch(request, env, ctx) {
    // Store env globally
    globalEnv = env;

    // Use httpServerHandler to handle the request
    const handler = httpServerHandler({ port: 3000 });
    return handler.fetch(request, env, ctx);
  },
};
