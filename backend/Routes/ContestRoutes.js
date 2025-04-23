const express = require('express');
const { createContest, joinContest, getContestDetails, addQuestionToContest, getAllContests } = require('../Controllers/ContestController');

const router = express.Router();

router.get('/', getAllContests);
router.post('/create', createContest);
router.post('/:contestId/join', joinContest);
router.get('/:contestId', getContestDetails);
router.post('/:contestId/add-question', addQuestionToContest);

module.exports = router;
