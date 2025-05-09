const Submission = require('../Models/Submission');
const Contest = require('../Models/Contest');
const User = require('../Models/User');
const Question = require('../Models/Question');
const runCode = require('../utils/runCode');

exports.submitCode = async (req, res) => {
    try {
        const { contestId, questionId, code, language, userId, isPracticeMode } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        // Validate language
        const supportedLanguages = ['cpp', 'c++', 'python', 'py', 'java'];
        if (!language || !supportedLanguages.includes(language.toLowerCase())) {
            return res.status(400).json({ 
                success: false, 
                message: `Unsupported language. Supported languages are: ${supportedLanguages.join(', ')}`
            });
        }

        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        // Get contest and user to track attempts
        const contest = await Contest.findById(contestId);
        const user = await User.findById(userId);

        if (!contest || !user) {
            return res.status(404).json({ 
                success: false, 
                message: !contest ? 'Contest not found' : 'User not found' 
            });
        }

        // If not in practice mode, check if user is a participant and contest is active
        if (!isPracticeMode) {
            // Check if user is a participant
            const participantIndex = contest.participants.findIndex(p => p.userId.toString() === userId);
            if (participantIndex === -1) {
                return res.status(403).json({ 
                    success: false, 
                    message: "You must join the contest before submitting solutions" 
                });
            }

        // Find the participant in the contest
        const participant = contest.participants[participantIndex];
        
        // Get previous attempts for this question
        const previousAttempts = await Submission.countDocuments({
            userId,
            contestId,
            questionId,
            status: { $ne: "Accepted" } // Only count unsuccessful attempts
        });

        console.log(`Previous attempts: ${previousAttempts}`);
        
        // Calculate penalty percentage (10% per failed attempt, max 50%)
        const penaltyPercentage = Math.min(previousAttempts * 10, 50);
        
        // Run test cases to determine verdict
        let verdict = "Accepted";
        let pointsAwarded = question.points;
        let errorDetails = null;

        for (let testCase of question.testCases) {
            try {
                console.log(`📝 Running test case: Input = ${testCase.input}`);
                const result = await runCode(code, testCase.input, language);
                console.log(`✅ Output: ${result.trim()}, Expected: ${testCase.expectedOutput.trim()}`);

                if (result.trim() !== testCase.expectedOutput.trim()) {
                    verdict = "Wrong Answer";
                    pointsAwarded = 0;
                    break;
                }
            } catch (error) {
                console.log(`❌ Error: ${error.verdict || 'Runtime Error'}`, error);
                verdict = error.verdict || "Runtime Error";
                errorDetails = error.error || error.message || "Unknown error";
                pointsAwarded = 0;
                break;
            }
        }

        console.log(`📌 Verdict: ${verdict}`);

        // Create and save submission record
        const submission = new Submission({
            userId,
            contestId,
            questionId,
            code,
            language,
            status: verdict,
            pointsAwarded: verdict === "Accepted" ? pointsAwarded : 0,
            errorDetails,
            isPracticeMode
        });

        await submission.save();

        // If the answer is correct and not in practice mode, update user's points with penalty applied
        if (verdict === "Accepted" && !isPracticeMode) {
            // Apply penalty to points
            const adjustedPoints = Math.ceil(pointsAwarded * (100 - penaltyPercentage) / 100);
            console.log(`Original points: ${pointsAwarded}, Penalty: ${penaltyPercentage}%, Adjusted points: ${adjustedPoints}`);

            // Update participant in contest
            const alreadySolved = participant.solvedQuestions && 
                                participant.solvedQuestions.includes(questionId);
            
            if (!alreadySolved) {
                participant.points = (participant.points || 0) + adjustedPoints;
                // Add to solved questions array
                if (!participant.solvedQuestions) {
                    participant.solvedQuestions = [];
                }
                participant.solvedQuestions.push(questionId);
                
                // Track attempts
                if (!participant.attempts) {
                    participant.attempts = {};
                }
                participant.attempts[questionId] = (previousAttempts + 1);
                
                // Update contest participants array
                contest.participants[participantIndex] = participant;
                await contest.save();
                
                // Update user's enrolled contests
                const enrolledContestIndex = user.enrolledContests.findIndex(c => 
                    c.contestId.toString() === contestId);
                
                if (enrolledContestIndex !== -1) {
                    const enrolledContest = user.enrolledContests[enrolledContestIndex];
                    
                    enrolledContest.points = (enrolledContest.points || 0) + adjustedPoints;
                    
                    // Add to solved questions array
                    if (!enrolledContest.solvedQuestions) {
                        enrolledContest.solvedQuestions = [];
                    }
                    enrolledContest.solvedQuestions.push(questionId);
                    
                    // Update user's enrolled contests array
                    user.enrolledContests[enrolledContestIndex] = enrolledContest;
                    await user.save();
                }
            }
        }

        res.json({
            success: true,
            submission: {
                status: verdict,
                pointsAwarded: verdict === "Accepted" ? pointsAwarded : 0,
                errorDetails,
                isPracticeMode
            }
        });
    }
    } catch (error) {
        console.error('Error submitting code:', error);
        res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: error.message 
        });
    }
}

exports.runCode = async (req, res) => {
    try {
        const { code, language, input } = req.body;

        // Validate language
        const supportedLanguages = ['cpp', 'c++', 'python', 'py', 'java'];
        if (!language || !supportedLanguages.includes(language.toLowerCase())) {
            return res.status(400).json({ 
                success: false, 
                message: `Unsupported language. Supported languages are: ${supportedLanguages.join(', ')}`
            });
        }

        // Run the code without saving a submission
        try {
            console.log(`📝 Running code with input: ${input}`);
            const result = await runCode(code, input, language);
            console.log(`✅ Output: ${result.trim()}`);

            // Return the result
            res.json({ 
                success: true, 
                output: result.trim()
            });
        } catch (error) {
            console.log(`❌ Error: ${error.verdict || 'Runtime Error'}`, error);
            res.status(400).json({ 
                success: false, 
                message: error.verdict || "Runtime Error", 
                error: error.error || error.message || "Unknown error" 
            });
        }
    } catch (error) {
        console.error("❌ Run Code Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: error.message || error 
        });
    }
};
