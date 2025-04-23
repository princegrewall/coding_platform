const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    testCases: [{
        input: { type: String, required: true },
        expectedOutput: { type: String, required: true }
    }],
    points: { type: Number, required: true }, // Points for solving this question
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest' }
});

module.exports = mongoose.model('Question', QuestionSchema);
