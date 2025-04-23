const express = require('express');
const { submitCode, runCode } = require('../Controllers/SubmissionController'); 

const router = express.Router();

router.post('/submit', submitCode); 
router.post('/run', runCode);

module.exports = router;
