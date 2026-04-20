const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    roll_number: { type: String, required: true, unique: true, trim: true },
    student_name: { type: String, required: true, trim: true },
    email: { type: String, default: '', lowercase: true },
    branch: { type: String, default: '', trim: true },
    year: { type: Number, default: 1, min: 1, max: 4 },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);