const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from backend folder
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('❌ MONGODB_URI not found in .env file');
            console.log('Looking for .env at:', envPath);
            process.exit(1);
        }
        
        console.log('📡 Connecting to MongoDB...');
        console.log(`   URI: ${process.env.MONGODB_URI}`);
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected Successfully');
        console.log(`📁 Database: ${mongoose.connection.name}`);
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        console.log('\n💡 Troubleshooting:');
        console.log('1. Make sure MongoDB is installed and running');
        console.log('2. Run "mongod" in a separate terminal');
        console.log('3. Check your .env file\n');
        process.exit(1);
    }
};

module.exports = connectDB;