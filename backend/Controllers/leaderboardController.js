const Contest = require('../Models/Contest');
const User = require('../Models/User');
const Submission = require('../Models/Submission');
const mongoose = require('mongoose');

// Penalty time in seconds for wrong submissions (5 minutes)
const WRONG_SUBMISSION_PENALTY = 300;

const getContestLeaderboard = async (req, res) => {
    try {
        const { contestId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(contestId)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid contest ID format" 
            });
        }

        // Fetch the contest with populated participant user details
        const contest = await Contest.findById(contestId)
            .populate({
                path: 'participants.userId',
                select: 'firstName lastName email'
            });

        if (!contest) {
            return res.status(404).json({ 
                success: false, 
                message: "Contest not found" 
            });
        }

        // Get all submissions for this contest to calculate solving time and penalties
        const allSubmissions = await Submission.find({
            contestId: contestId
        }).sort({ submittedAt: 1 }); // Sort by submission time, earliest first

        // Create maps to track submissions
        const userQuestionTimes = {}; // For accepted submissions
        const wrongSubmissionCounts = {}; // To count wrong submissions per user per question
        
        allSubmissions.forEach(submission => {
            const userId = submission.userId.toString();
            const questionId = submission.questionId.toString();
            const key = `${userId}-${questionId}`;
            
            if (submission.status === "Accepted") {
                // Only keep the earliest accepted submission time for each user-question combo
                if (!userQuestionTimes[key]) {
                    userQuestionTimes[key] = {
                        submittedAt: submission.submittedAt,
                        userId: userId,
                        questionId: questionId
                    };
                }
            } else {
                // Only count wrong submissions that occurred before the correct solution
                if (!userQuestionTimes[key] || submission.submittedAt < userQuestionTimes[key].submittedAt) {
                    if (!wrongSubmissionCounts[key]) {
                        wrongSubmissionCounts[key] = 0;
                    }
                    wrongSubmissionCounts[key]++;
                }
            }
        });

        // Transform contest participants for leaderboard
        let leaderboard = contest.participants.map(participant => {
            const userId = participant.userId._id.toString();
            const solvedCount = participant.solvedQuestions ? participant.solvedQuestions.length : 0;
            
            // Calculate total time taken for all solved questions
            let totalTimeTaken = 0;
            let totalPenalties = 0;
            
            if (participant.solvedQuestions) {
                participant.solvedQuestions.forEach(questionId => {
                    const qid = questionId.toString();
                    const key = `${userId}-${qid}`;
                    
                    // Add time for accepted submission
                    if (userQuestionTimes[key]) {
                        const submissionTime = new Date(userQuestionTimes[key].submittedAt);
                        const contestStartTime = new Date(contest.startTime);
                        totalTimeTaken += (submissionTime - contestStartTime) / 1000; // in seconds
                    }
                    
                    // Add penalty for wrong submissions
                    if (wrongSubmissionCounts[key]) {
                        totalPenalties += wrongSubmissionCounts[key] * WRONG_SUBMISSION_PENALTY;
                    }
                });
            }
            
            // Total time with penalties
            const totalTimeWithPenalties = totalTimeTaken + totalPenalties;
            
            return {
                userId: userId,
                name: `${participant.userId.firstName} ${participant.userId.lastName}`,
                email: participant.userId.email,
                points: participant.points,
                problemsSolved: solvedCount,
                solvingTime: totalTimeTaken, // Raw solving time without penalties
                wrongSubmissions: Object.keys(wrongSubmissionCounts)
                    .filter(key => key.startsWith(userId))
                    .reduce((total, key) => total + wrongSubmissionCounts[key], 0),
                penalties: totalPenalties,
                totalTime: totalTimeWithPenalties, // Total time with penalties included
            };
        });
        
        // Sort the leaderboard:
        // 1. First by points (descending)
        // 2. If points are equal, by the number of problems solved (descending)
        // 3. If problems solved are equal, by total time taken with penalties (ascending)
        leaderboard.sort((a, b) => {
            if (b.points !== a.points) {
                return b.points - a.points; // Higher points first
            }
            if (b.problemsSolved !== a.problemsSolved) {
                return b.problemsSolved - a.problemsSolved; // More problems solved first
            }
            return a.totalTime - b.totalTime; // Less time taken first (including penalties)
        });

        // Add position/rank to each entry
        leaderboard = leaderboard.map((entry, index) => ({
            ...entry,
            rank: index + 1
        }));

        res.json({ 
            success: true, 
            contestName: contest.name,
            startTime: contest.startTime,
            endTime: contest.endTime,
            penaltyPerWrongSubmission: WRONG_SUBMISSION_PENALTY,
            leaderboard: leaderboard
        });
    } catch (error) {
        console.error("Leaderboard error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: error.message 
        });
    }
};

const getGlobalLeaderboard = async (req, res) => {
    try {
        const users = await User.find().select('firstName lastName email totalPoints enrolledContests');
        
        // Count total problems solved across all contests
        let leaderboard = users.map(user => {
            let totalProblemsSolved = 0;
            let contestsParticipated = 0;
            
            if (user.enrolledContests && user.enrolledContests.length > 0) {
                contestsParticipated = user.enrolledContests.length;
                
                // Count unique problems solved across all contests
                const solvedQuestionIds = new Set();
                user.enrolledContests.forEach(contest => {
                    if (contest.solvedQuestions && contest.solvedQuestions.length > 0) {
                        contest.solvedQuestions.forEach(questionId => {
                            solvedQuestionIds.add(questionId.toString());
                        });
                    }
                });
                
                totalProblemsSolved = solvedQuestionIds.size;
            }
            
            return {
                userId: user._id,
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                totalPoints: user.totalPoints || 0,
                totalProblemsSolved,
                contestsParticipated
            };
        });
        
        // Sort by points, then by problems solved
        leaderboard.sort((a, b) => {
            if (b.totalPoints !== a.totalPoints) {
                return b.totalPoints - a.totalPoints;
            }
            return b.totalProblemsSolved - a.totalProblemsSolved;
        });
        
        // Add ranks
        leaderboard = leaderboard.map((entry, index) => ({
            ...entry,
            rank: index + 1
        }));

        res.json({ 
            success: true, 
            leaderboard 
        });
    } catch (error) {
        console.error("Global leaderboard error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: error.message 
        });
    }
};

module.exports = { getContestLeaderboard, getGlobalLeaderboard };
