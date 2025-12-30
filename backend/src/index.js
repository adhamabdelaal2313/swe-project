// 1. Load imports and start the database connection check
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Feature-first architecture: Import routes from each feature folder
const portalRoutes = require('./portal/portal.routes');
const tasksRoutes = require('./tasks/tasks.routes');
const kanbanRoutes = require('./kanban/kanban.routes');
const teamsRoutes = require('./teams/teams.routes');
const dashboardRoutes = require('./dashboard/dashboard.routes');
const adminRoutes = require('./admin/admin.routes');

// Initialize database connection
require('./config/db.config.js'); 

// 2. Start the Express server part
const app = express();

// Configure CORS to allow requests from Vercel frontend
const getAllowedOrigins = () => {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const origins = [];
  
  // Always allow localhost in development
  if (isDevelopment) {
    origins.push('http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000');
  }
  
  // Add production origins from FRONTEND_URL
  if (process.env.FRONTEND_URL) {
    // Support multiple origins separated by commas, remove trailing slashes
    const productionOrigins = process.env.FRONTEND_URL.split(',')
      .map(url => url.trim().replace(/\/$/, '')); // Remove trailing slashes
    origins.push(...productionOrigins);
  }
  
  if (origins.length > 0) {
    console.log(`[CORS] Allowed origins configured: ${origins.join(', ')}`);
    return origins;
  }
  
  // If no origins configured, allow all (fallback)
  console.log('[CORS] No origins configured, allowing all origins');
  return '*';
};

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (like mobile apps, Postman, or same-origin requests)
    if (!origin) {
      console.log('[CORS] Request with no origin, allowing');
      return callback(null, true);
    }
    
    console.log(`[CORS] Request from origin: ${origin}`);
    
    // If allowedOrigins is '*', allow all
    if (allowedOrigins === '*' || (Array.isArray(allowedOrigins) && allowedOrigins.includes('*'))) {
      console.log('[CORS] Allowing all origins');
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (Array.isArray(allowedOrigins) && allowedOrigins.includes(origin)) {
      console.log(`[CORS] ✅ Origin ${origin} is allowed`);
      callback(null, true);
    } else {
      console.log(`[CORS] ❌ Blocked origin: ${origin}`);
      console.log(`[CORS] Allowed origins: ${Array.isArray(allowedOrigins) ? allowedOrigins.join(', ') : allowedOrigins}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions)); // Enable CORS for all routes
app.use(express.json()); // Allows Express to read JSON data from requests

// Health check endpoint (for Railway/Render deployment monitoring)
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 3. Serve API routes
app.use('/api/portal', portalRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/kanban', kanbanRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes); 

// 4. Serve static files from the frontend/dist folder
// This includes favicon, images, and other assets
app.use(express.static(path.join(__dirname, '../../frontend/dist'), {
    maxAge: '1y', // Cache static assets for 1 year
    etag: true,
    lastModified: true
}));

// 5. Catch-all: serve the frontend's index.html for any non-API GET requests
// But exclude static file requests (images, favicon, etc.)
app.use((req, res, next) => {
    // Only handle GET requests that are not for API routes or static files
    if (req.method === 'GET' && 
        !req.path.startsWith('/api') && 
        !req.path.match(/\.(png|jpg|jpeg|gif|ico|svg|css|js|woff|woff2|ttf|eot)$/i)) {
        return res.sendFile(path.join(__dirname, '../../frontend/dist', 'index.html'));
    }
    next();
});

// --- 6. GLOBAL ERROR HANDLING ---

// 6a. 404 Handler (Catch any request that didn't match a route)
app.use((req, res, next) => {
    res.status(404).send("404: Route Not Found");
});

// 6b. Global Error Handler
app.use((err, req, res, next) => {
    // 💡 This is the line that will print the hidden error!
    console.error("🚨 GLOBAL CAUGHT ERROR: ", err.stack); 
    
    // Check if headers have already been sent to prevent crash
    if (res.headersSent) {
        return next(err);
    }
    
    // Send a generic 500 response (or the specific status if available)
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        message: 'A critical server error occurred.',
        // For debugging, send a simplified message
        errorDetail: err.message 
    });
});

// 6. Export the app for testing
module.exports = app;
