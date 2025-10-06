// models/Fund.model.js (Correct)

const mongoose = require('mongoose');

const FundSchema = new mongoose.Schema({
    problem: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Problem', 
        required: true 
    },
    allocatedAmount: { 
        type: Number, 
        required: true 
    },
    utilizedAmount: { 
        type: Number, 
        default: 0 
    },
    source: { 
        type: String, 
        required: true, 
        // e.g., 'Municipal Budget', 'State Grant'
    }, 
    allocatedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    notes: String,
}, { timestamps: true });

module.exports = mongoose.model('Fund', FundSchema);