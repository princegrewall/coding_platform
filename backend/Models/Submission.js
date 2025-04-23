const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    code: { type: String, required: true },
    language: { type: String, required: true, enum: ['cpp', 'c++', 'python', 'py', 'java'] },
    status: { 
        type: String, 
        required: true, 
        enum: ['Accepted', 'Wrong Answer', 'Compilation Error', 'Runtime Error', 'Time Limit Exceeded', 'Unsupported Language'] 
    },
    pointsAwarded: { type: Number, default: 0 },
    errorDetails: { type: String, default: null },
    submittedAt: { type: Date, default: Date.now }
});

// Add index to improve leaderboard queries
SubmissionSchema.index({ contestId: 1, userId: 1, status: 1 });

module.exports = mongoose.model('Submission', SubmissionSchema);
