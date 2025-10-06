// routes/problem.routes.js
const express = require('express');
const router = express.Router();
const { createProblem, getProblems, getProblemById, updateProblemStatus } = require('../controllers/problem.controller');
const { verifyToken, isOfficial } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.route('/')
    .post(verifyToken, upload, createProblem) // All users can create
    .get(getProblems); // Publicly viewable

router.route('/:id')
    .get(getProblemById); // Publicly viewable

router.route('/:id/status')
    .patch(verifyToken, isOfficial, updateProblemStatus); // Officials only

module.exports = router;

// controllers/problem.controller.js
const Problem = require('../models/Problem.model');
const Notification = require('../models/Notification.model');

exports.createProblem = async (req, res) => {
    const { title, description, category, longitude, latitude, address } = req.body;
    if (!req.file) {
        return res.status(400).json({ message: 'Proof image is required.' });
    }
    try {
        const problem = new Problem({
            title, description, category,
            location: {
                coordinates: [longitude, latitude],
                address
            },
            proofImage: req.file.path,
            submittedBy: req.user._id,
        });
        const createdProblem = await problem.save();
        res.status(201).json(createdProblem);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getProblems = async (req, res) => {
    try {
        const problems = await Problem.find({}).populate('submittedBy', 'name').sort({ createdAt: -1 });
        res.json(problems);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getProblemById = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id).populate('submittedBy', 'name email');
        if (!problem) return res.status(404).json({ message: 'Problem not found' });
        res.json(problem);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateProblemStatus = async (req, res) => {
    const { status } = req.body; // Expecting 'Investigating' or 'Resolved'
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) return res.status(404).json({ message: 'Problem not found' });

        problem.status = status;
        problem.assignedTo = req.user._id;
        const updatedProblem = await problem.save();
        
        // ** Create a notification for the user who submitted the problem **
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