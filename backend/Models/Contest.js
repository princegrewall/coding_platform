const mongoose = require('mongoose');

const ContestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    participants: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        points: { type: Number, default: 0 },
        solvedQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contest', ContestSchema);
