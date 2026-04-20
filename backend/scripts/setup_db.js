const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from backend folder (absolute path)
const envPath = path.resolve(__dirname, '..', '.env');
console.log('Loading .env from:', envPath);

const result = dotenv.config({ path: envPath });
if (result.error) {
    console.error('Error loading .env:', result.error);
    process.exit(1);
}

console.log('Environment loaded successfully!');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✓ Found' : '✗ Not found');
console.log('PORT:', process.env.PORT || 'not set');

const User = require('../models/User');
const Subject = require('../models/Subject');

async function setupDatabase() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('\n❌ MONGODB_URI not found in .env file');
            console.log('Current working directory:', process.cwd());
            console.log('Looking for .env at:', envPath);
            process.exit(1);
        }
        
        console.log('\n📡 Connecting to MongoDB...');
        console.log(`   URI: ${process.env.MONGODB_URI}`);
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        // Clear existing data
        await User.deleteMany({});
        await Subject.deleteMany({});
        console.log('✅ Cleared existing collections');
        
        // Create admin user
        const admin = new User({
            username: 'admin',
            password: 'admin123',
            email: 'admin@college.edu',
            full_name: 'Administrator',
            role: 'admin'
        });
        await admin.save();
        console.log('✅ Admin user created - Username: admin, Password: admin123');
        
        // Create sample subjects
        const subjects = [
            { subject_code: 'CS101', subject_name: 'Programming Fundamentals' },
            { subject_code: 'CS102', subject_name: 'Data Structures' },
            { subject_code: 'CS103', subject_name: 'Database Management Systems' },
            { subject_code: 'CS104', subject_name: 'Web Technologies' },
            { subject_code: 'CS105', subject_name: 'Operating Systems' }
        ];
        
        for (const subject of subjects) {
            const newSubject = new Subject(subject);
            await newSubject.save();
        }
        console.log('✅ Sample subjects created');
        
        console.log('\n🎉 Database setup completed!');
        console.log('📝 Admin Login: username: admin, password: admin123\n');
        
        await mongoose.disconnect();
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n⚠️ Make sure MongoDB is running!');
            console.log('   Start MongoDB:');
            console.log('   - Windows: net start MongoDB');
            console.log('   - Or run: mongod');
        }
        process.exit(1);
    }
}

setupDatabase();