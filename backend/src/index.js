require('dotenv').config();
const app = require('./app');

// Add debug logging
console.log('Environment Check:');
console.log('- NODE_ENV:', process.env.NODE_ENV);

const PORT = process.env.PORT || 3000;

try {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
} catch (error) {
    console.error('Failed to start server:', error);
} 