const Contest = require('../Models/Contest');
const User = require('../Models/User');

exports.getAllContests = async (req, res) => {
    try {
        const contests = await Contest.find()
            .select('name description startTime endTime participants questions')
            .sort({ startTime: 1 }); // Sort by start time ascending

        res.status(200).json({ success: true, contests });
    } catch (error) {
        console.error("Error fetching contests:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

exports.createContest = async (req, res) => {
    try {
        const { userId, name, description, startTime, endTime } = req.body;  // Get userId from request body
        if (!userId) return res.status(400).json({ success: false, message: "User ID required" });

        const contest = new Contest({ name, description, startTime, endTime, createdBy: userId });
        await contest.save();
        res.status(201).json({ success: true, contest });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
};

exports.joinContest = async (req, res) => {
    try {
        const { contestId } = req.params;
        const { userId } = req.body;  // Get userId from request body
        if (!userId) return res.status(400).json({ success: false, message: "User ID required" });

        const contest = await Contest.findById(contestId);
        if (!contest) return res.status(404).json({ success: false, message: "Contest not found" });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // Check if user already joined
        if (contest.participants.some(p => p.userId.toString() === userId)) {
            return res.status(400).json({ success: false, message: "Already joined this contest" });
        }

        contest.participants.push({ userId, points: 0 });
        user.enrolledContests.push({ contestId, points: 0 });

        await contest.save();
        await user.save();

        res.status(200).json({ success: true, message: "Joined contest successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
};

exports.getContestDetails = async (req, res) => {
    try {
        const { contestId } = req.params;
        const contest = await Contest.findById(contestId)
            .populate('questions')
            .populate('participants.userId', 'firstName lastName points');

        if (!contest) return res.status(404).json({ success: false, message: "Contest not found" });

        res.status(200).json({ success: true, contest });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
};

exports.addQuestionToContest = async (req, res) => {
    try {
        const { contestId } = req.params;
        const { userId, questionId } = req.body;  // Get userId from request body
        if (!userId) return res.status(400).json({ success: false, message: "User ID required" });

        const contest = await Contest.findById(contestId);
        if (!contest) return res.status(404).json({ success: false, message: "Contest not found" });

        // Check if user is contest creator
        if (contest.createdBy.toString() !== userId) {
            return res.status(403).json({ success: false, message: "You are not authorized to add questions" });
        }

        contest.questions.push(questionId);
        await contest.save();

        res.status(200).json({ success: true, message: "Question added to contest" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
};
