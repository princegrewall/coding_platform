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
        const { userId, name, description, startTime, endTime } = req.body;

        // Validate required fields
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }
        if (!name) {
            return res.status(400).json({ success: false, message: "Contest name is required" });
        }
        if (!startTime) {
            return res.status(400).json({ success: false, message: "Start time is required" });
        }
        if (!endTime) {
            return res.status(400).json({ success: false, message: "End time is required" });
        }

        // Validate dates
        const start = new Date(startTime);
        const end = new Date(endTime);
        const now = new Date();

        if (isNaN(start.getTime())) {
            return res.status(400).json({ success: false, message: "Invalid start time format" });
        }
        if (isNaN(end.getTime())) {
            return res.status(400).json({ success: false, message: "Invalid end time format" });
        }
        if (start >= end) {
            return res.status(400).json({ success: false, message: "End time must be after start time" });
        }
        if (start < now) {
            return res.status(400).json({ success: false, message: "Start time cannot be in the past" });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Create the contest
        const contest = new Contest({
            name,
            description: description || '',
            startTime,
            endTime,
            createdBy: userId,
            participants: [],
            questions: []
        });

        await contest.save();

        res.status(201).json({ 
            success: true, 
            message: "Contest created successfully",
            contest 
        });
    } catch (error) {
        console.error('Error creating contest:', error);
        res.status(500).json({ 
            success: false, 
            message: "Server error while creating contest",
            error: error.message 
        });
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
        console.log('Fetching contest details for ID:', contestId);
        
        const contest = await Contest.findById(contestId)
            .populate({
                path: 'questions',
                select: 'title description difficulty points testCases'
            })
            .populate('participants.userId', 'firstName lastName points');

        if (!contest) {
            console.log('Contest not found:', contestId);
            return res.status(404).json({ success: false, message: "Contest not found" });
        }

        console.log('Found contest:', {
            id: contest._id,
            name: contest.name,
            questionCount: contest.questions.length,
            questions: contest.questions.map(q => ({
                id: q._id,
                title: q.title
            }))
        });

        res.status(200).json({ 
            success: true, 
            contest 
        });
    } catch (error) {
        console.error('Error in getContestDetails:', error);
        res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: error.message 
        });
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
