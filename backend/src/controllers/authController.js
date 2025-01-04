const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool } = require('../db');

const authController = {
    // Register a new user
    register: async (req, res) => {
        try {
            const { username, email, password } = req.body;

            // Validate input
            if (!username || !email || !password) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            // Check if user already exists
            const userExists = await pool.query(
                'SELECT * FROM users WHERE email = $1 OR username = $2',
                [email, username]
            );

            if (userExists.rows.length > 0) {
                return res.status(400).json({ error: 'User already exists' });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create user
            const result = await pool.query(
                'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
                [username, email, hashedPassword]
            );

            const user = result.rows[0];

            // Create token
            const token = jwt.sign(
                { id: user.id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            res.status(201).json({
                id: user.id,
                username: user.username,
                email: user.email,
                token
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ 
                error: 'Failed to register user',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Login user
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Validate input
            if (!email || !password) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            // Check if user exists
            const result = await pool.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );

            const user = result.rows[0];

            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Check password
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Create token
            const token = jwt.sign(
                { id: user.id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            res.json({
                id: user.id,
                username: user.username,
                email: user.email,
                token
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ 
                error: 'Failed to login',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Get current user
    getCurrentUser: async (req, res) => {
        try {
            const result = await pool.query(
                'SELECT id, username, email FROM users WHERE id = $1',
                [req.user.id]
            );

            const user = result.rows[0];

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json(user);
        } catch (error) {
            console.error('Get current user error:', error);
            res.status(500).json({ 
                error: 'Failed to get user',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Update user profile
    updateProfile: async (req, res) => {
        try {
            const { username, email, currentPassword, newPassword } = req.body;
            const userId = req.user.id;

            // Get current user data
            const currentUser = await pool.query(
                'SELECT * FROM users WHERE id = $1',
                [userId]
            );

            if (!currentUser.rows[0]) {
                return res.status(404).json({ error: 'User not found' });
            }

            let updateFields = [];
            let values = [];
            let paramCount = 1;

            if (username) {
                updateFields.push(`username = $${paramCount}`);
                values.push(username);
                paramCount++;
            }

            if (email) {
                updateFields.push(`email = $${paramCount}`);
                values.push(email);
                paramCount++;
            }

            if (newPassword) {
                // Verify current password
                const isMatch = await bcrypt.compare(currentPassword, currentUser.rows[0].password);
                if (!isMatch) {
                    return res.status(401).json({ error: 'Current password is incorrect' });
                }

                // Hash new password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(newPassword, salt);
                updateFields.push(`password = $${paramCount}`);
                values.push(hashedPassword);
                paramCount++;
            }

            if (updateFields.length === 0) {
                return res.status(400).json({ error: 'No fields to update' });
            }

            // Add user ID to values array
            values.push(userId);

            // Update user
            const result = await pool.query(
                `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING id, username, email`,
                values
            );

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({ 
                error: 'Failed to update profile',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};

module.exports = authController; 