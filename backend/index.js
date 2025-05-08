const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const AuthRouter = require('./Routes/AuthRouter');
const ContestRouter = require('./Routes/ContestRoutes');
const QuestionRouter = require('./Routes/QuestionRoutes');
const SubmissionRouter = require('./Routes/SubmissionRoutes');
const leaderboardRoutes = require('./Routes/leaderboardRoutes');

require('dotenv').config();
require('./Models/db');
const PORT = process.env.PORT || 4001;

// Middleware setup
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Health check route
app.get('/ping', (req, res) => {
    res.send('PONG');
});

// API routes
app.use('/auth', AuthRouter);
app.use('/contests', ContestRouter);
app.use('/questions', QuestionRouter);
app.use('/submissions', SubmissionRouter);
app.use('/leaderboard', leaderboardRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
