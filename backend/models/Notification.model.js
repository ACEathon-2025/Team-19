// models/Notification.model.js (Corrected)

const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    isRead: { 
        type: Boolean, 
        default: false 
    },
    relatedProblem: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Problem' 
    },
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);