const express = require('express');
const { createQuestion, getAllQuestions, getQuestionById } = require('../Controllers/QuestionController');
const router = express.Router();

router.post('/create', createQuestion);
router.get('/', getAllQuestions);
router.get('/:questionId', getQuestionById); 

module.exports = router;
