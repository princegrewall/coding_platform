const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    enrolledContests: [{
        contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest' },
        points: { type: Number, default: 0 },
        solvedQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
    }],
    totalPoints: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
