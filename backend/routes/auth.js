const express = require('express');
const router = express.Router();

// Test route to verify the router is working
router.get('/test', (req, res) => {
    res.json({ message: 'Auth router is working' });
});

router.post('/register', async (req, res) => {
    try {
        console.log('Registration request received:', req.body);
        
        const { email, password, preferences } = req.body;
        
        // For testing, send back the received data
        res.status(200).json({
            message: 'Registration successful',
            user: { email, preferences },
            token: 'test-token'
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 