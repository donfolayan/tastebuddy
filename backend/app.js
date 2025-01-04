const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');  // Make sure this path is correct

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());  // Important! This parses JSON request bodies

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);  // Make sure the path matches your frontend requests

// Basic error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app; 