require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');

const app = express();

// More permissive CORS for development
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:5174'
        ];
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
};

// Error handling for middleware
app.use((req, res, next) => {
    try {
        next();
    } catch (error) {
        console.error('Middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.use(cors(corsOptions));
app.use(express.json());

// Test route with error handling
app.get('/', (req, res) => {
    try {
        res.json({ message: 'Server is running' });
    } catch (error) {
        console.error('Error in test route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);

// Global error handling
app.use((err, req, res, next) => {
    console.error('Global error handler:', err.stack);
    res.status(500).json({ 
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Handle 404s
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

module.exports = app; 