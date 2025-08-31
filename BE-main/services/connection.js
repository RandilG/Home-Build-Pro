const mysql = require('mysql2'); // Use mysql2 for better compatibility
const dotenv = require('dotenv');

dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'HomeBuild',
    password: process.env.DB_PASS || '4403615@Rg',
    database: process.env.DB_NAME || 'homebuild',
    port: process.env.PORT || 3306
});

// Connect to database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
        return;
    }
    console.log('Connected to database');
});

// Handle connection errors
connection.on('error', (err) => {
    console.error('Database error:', err.message);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Reconnecting to database...');
        connection.connect();
    }
});

module.exports = connection;
