const Question = require('../Models/Question');

const createQuestion = async (req, res) => {
    try {
        const question = new Question(req.body);
        await question.save();
        res.status(201).json({ success: true, question });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
};

const getAllQuestions = async (req, res) => {
    try {
        const questions = await Question.find();
        res.status(200).json({ success: true, questions });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
};

const getQuestionById = async (req, res) => {
  try {
    const questionId = req.params.questionId.trim();
    console.log("Fetching question with ID:", questionId); // Debug log
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    res.json({ success: true, question });
  } catch (error) {
    console.error("Error in getQuestionById:", error);
    res.status(500).json({ success: false, error });
  }
};


module.exports = { createQuestion, getAllQuestions, getQuestionById };
