// controllers/problem.controller.js (Corrected)

const Problem = require('../models/Problem.model');
const Notification = require('../models/Notification.model');

// Controller function to create a new problem
const createProblem = async (req, res) => {
    const { title, description, category, longitude, latitude, address } = req.body;
    
    // Check if a file was uploaded
    if (!req.file) {
        return res.status(400).json({ message: 'Proof image is required.' });
    }

    try {
        const problem = new Problem({
            title,
            description,
            category,
            location: {
                // GeoJSON format requires longitude first, then latitude
                coordinates: [longitude, latitude],
                address
            },
            // The path to the uploaded file is available on req.file.path
            proofImage: req.file.path,
            // The authenticated user's ID is attached by the verifyToken middleware
            submittedBy: req.user._id,
        });

        const createdProblem = await problem.save();
        res.status(201).json(createdProblem);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Controller function to get all problems
const getProblems = async (req, res) => {
    try {
        const problems = await Problem.find({}).populate('submittedBy', 'name').sort({ createdAt: -1 });
        res.json(problems);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Controller function to get a single problem by its ID
const getProblemById = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id).populate('submittedBy', 'name email');
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        res.json(problem);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Controller function for Officials to update a problem's status
const updateProblemStatus = async (req, res) => {
    const { status } = req.body; // Expecting 'Investigating' or 'Resolved'
    
    // Simple validation for status
    if (!['Pending', 'Investigating', 'Resolved'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value.' });
    }
    
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        problem.status = status;
        // Assign the official who is updating the status
        problem.assignedTo = req.user._id;
        const updatedProblem = await problem.save();
        
        // Create a notification for the user who submitted the problem
        await Notification.create({
            recipient: problem.submittedBy,
            message: `The status of your report '${problem.title}' has been updated to ${status}.`,
            relatedProblem: problem._id,
        });
        
        res.json(updatedProblem);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Export all the controller functions
module.exports = {
    createProblem,
    getProblems,
    getProblemById,
    updateProblemStatus,
};