const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    subject_code: { type: String, required: true, unique: true, trim: true },
    subject_name: { type: String, required: true, trim: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Subject', subjectSchema);