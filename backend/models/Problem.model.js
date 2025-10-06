// models/Problem.model.js
const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }, // [longitude, latitude]
        address: { type: String }
    },
    status: {
        type: String,
        enum: ['Pending', 'Investigating', 'Resolved'],
        default: 'Pending',
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    proofImage: { type: String, required: true }, // Path to the uploaded image
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true });

// Create a 2dsphere index for geospatial queries
ProblemSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Problem', ProblemSchema);