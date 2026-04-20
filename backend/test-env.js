const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
console.log('Looking for .env at:', envPath);
console.log('File exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
    console.log('File content:');
    console.log(fs.readFileSync(envPath, 'utf8'));
}

// Try to load .env
const result = dotenv.config({ path: envPath });
console.log('\nDotenv result:', result.error || 'Success');

// Check loaded variables
console.log('\nLoaded environment variables:');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('SESSION_SECRET:', process.env.SESSION_SECRET);