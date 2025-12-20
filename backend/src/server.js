const app = require('./index');
const PORT = process.env.PORT || 3000;

// Bind to 0.0.0.0 to allow Railway to connect
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is happily listening on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`CORS allowed origins: ${process.env.FRONTEND_URL || 'all'}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

