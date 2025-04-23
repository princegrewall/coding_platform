const express = require('express');
const router = express.Router();
const leaderboardController = require('../Controllers/leaderboardController');
const ensureAuthenticated = require('../Middlewares/Auth');

// 🔥 Ensure `/global` is defined before `/:contestId`
router.get('/contest/:contestId', ensureAuthenticated, leaderboardController.getContestLeaderboard);
router.get('/global', ensureAuthenticated, leaderboardController.getGlobalLeaderboard);

module.exports = router;
