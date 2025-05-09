import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../utils/authContext';

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
}

interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  testCases: TestCase[];
  points: number;
}

const CreateContest: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  // API base URL
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4010';
  
  // Contest details
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('1'); // Default 1 hour
  
  // Questions
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Current question being edited
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: '',
    title: '',
    description: '',
    difficulty: 'Medium',
    testCases: [],
    points: 100
  });
  
  // Current test case being edited
  const [currentTestCase, setCurrentTestCase] = useState<TestCase>({
    id: '',
    input: '',
    expectedOutput: ''
  });
  
  // UI states
  const [editingQuestion, setEditingQuestion] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState(false);
  
  // Helper to generate unique IDs
  const generateId = () => `_${Math.random().toString(36).substr(2, 9)}`;
  
  // Calculate end time based on start time and duration
  const calculateEndTime = () => {
    if (!startTime) return null;
    
    const start = new Date(startTime);
    const durationHours = parseFloat(duration);
    
    if (isNaN(start.getTime()) || isNaN(durationHours)) return null;
    
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
    return end;
  };
  
  // Get formatted end time for display
  const getEndTimeString = () => {
    const endTime = calculateEndTime();
    if (!endTime) return '';
    
    return endTime.toLocaleString();
  };
  
  // Add a question to the contest
  const addQuestion = () => {
    if (!currentQuestion.title.trim()) {
      toast.error('Question title is required');
      return;
    }
    
    if (currentQuestion.testCases.length === 0) {
      toast.error('At least one test case is required');
      return;
    }
    
    const newQuestion = {
      ...currentQuestion,
      id: currentQuestion.id || generateId()
    };
    
    if (currentQuestion.id) {
      // Edit existing question
      setQuestions(questions.map(q => q.id === currentQuestion.id ? newQuestion : q));
    } else {
      // Add new question
      setQuestions([...questions, newQuestion]);
    }
    
    // Reset form
    setCurrentQuestion({
      id: '',
      title: '',
      description: '',
      difficulty: 'Medium',
      testCases: [],
      points: 100
    });
    
    setEditingQuestion(false);
  };
  
  // Edit an existing question
  const editQuestion = (question: Question) => {
    setCurrentQuestion(question);
    setEditingQuestion(true);
  };
  
  // Remove a question
  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };
  
  // Add a test case to the current question
  const addTestCase = () => {
    if (!currentTestCase.input.trim() || !currentTestCase.expectedOutput.trim()) {
      toast.error('Both input and expected output are required');
      return;
    }
    
    const newTestCase = {
      ...currentTestCase,
      id: currentTestCase.id || generateId()
    };
    
    if (currentTestCase.id) {
      // Edit existing test case
      setCurrentQuestion({
        ...currentQuestion,
        testCases: currentQuestion.testCases.map(tc => 
          tc.id === currentTestCase.id ? newTestCase : tc
        )
      });
    } else {
      // Add new test case
      setCurrentQuestion({
        ...currentQuestion,
        testCases: [...currentQuestion.testCases, newTestCase]
      });
    }
    
    // Reset form
    setCurrentTestCase({
      id: '',
      input: '',
      expectedOutput: ''
    });
    
    setEditingTestCase(false);
  };
  
  // Edit an existing test case
  const editTestCase = (testCase: TestCase) => {
    setCurrentTestCase(testCase);
    setEditingTestCase(true);
  };
  
  // Remove a test case
  const removeTestCase = (id: string) => {
    setCurrentQuestion({
      ...currentQuestion,
      testCases: currentQuestion.testCases.filter(tc => tc.id !== id)
    });
  };
  
  // Submit the contest
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to create a contest');
      navigate('/login');
      return;
    }
    
    if (!name.trim()) {
      toast.error('Contest name is required');
      return;
    }
    
    if (!startTime) {
      toast.error('Start time is required');
      return;
    }
    
    if (questions.length === 0) {
      toast.error('At least one question is required');
      return;
    }
    
    const endTime = calculateEndTime();
    if (!endTime) {
      toast.error('Invalid time configuration');
      return;
    }
    
    // Check if start time is in the past
    if (new Date(startTime) < new Date()) {
      toast.error('Start time cannot be in the past');
      return;
    }
    
    // Format the data for API
    const contestData = {
      userId: user.id,
      name,
      description,
      startTime: new Date(startTime).toISOString(),
      endTime: endTime.toISOString()
    };
    
    try {
      setLoading(true);
      
      // Step 1: Create the contest
      const contestResponse = await axios.post(
        `${API_URL}/contests/create`,
        contestData,
        { withCredentials: true }
      );
      
      if (!contestResponse.data.success) {
        toast.error(contestResponse.data.message || 'Failed to create contest');
        setLoading(false);
        return;
      }
      
      const contestId = contestResponse.data.contest._id;
      
      // Step 2: Add questions one by one
      const questionPromises = questions.map(async (question) => {
        // First create the question
        const questionData = {
          title: question.title,
          description: question.description,
          difficulty: question.difficulty,
          points: question.points,
          testCases: question.testCases.map(tc => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput
          }))
        };
        
        const questionResponse = await axios.post(
          `${API_URL}/questions/create`,
          questionData,
          { withCredentials: true }
        );
        
        if (!questionResponse.data.success) {
          throw new Error(`Failed to add question: ${questionResponse.data.message || 'Unknown error'}`);
        }
        
        // Then add it to the contest
        const questionId = questionResponse.data.question._id;
        
        await axios.post(
          `${API_URL}/contests/${contestId}/add-question`,
          { userId: user.id, questionId },
          { withCredentials: true }
        );
      });
      
      await Promise.all(questionPromises);
      
      toast.success('Contest created successfully');
      navigate('/contests'); // Redirect to contests list
    } catch (error: any) {
      console.error('Error creating contest:', error);
      toast.error(error.response?.data?.message || error.message || 'An error occurred while creating the contest');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Create New Contest</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Contest Details Section */}
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Contest Details</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-1">
                Contest Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-foreground"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-muted-foreground mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-foreground"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-muted-foreground mb-1">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  id="startTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-foreground"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-muted-foreground mb-1">
                  Duration (hours) *
                </label>
                <input
                  type="number"
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="0.5"
                  step="0.5"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-foreground"
                  required
                />
              </div>
            </div>
            
            {startTime && (
              <div className="bg-primary/10 p-3 rounded-md border border-primary/20">
                <p className="text-sm text-primary">
                  <span className="font-semibold">Contest End Time:</span> {getEndTimeString()}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Questions Section */}
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Contest Questions</h2>
          
          {questions.length === 0 ? (
            <div className="text-center py-6 bg-muted rounded-md border border-border">
              <p className="text-muted-foreground">No questions added yet</p>
              <button
                type="button"
                onClick={() => setEditingQuestion(true)}
                className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Add Your First Question
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question) => (
                <div 
                  key={question.id} 
                  className="border border-border rounded-md p-4 bg-muted hover:bg-muted/80 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg text-foreground">{question.title}</h3>
                      <div className="flex space-x-3 mt-1 text-sm">
                        <span className={`
                          px-2 py-0.5 rounded-full 
                          ${question.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' : 
                            question.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' : 
                            'bg-red-500/10 text-red-400'}
                        `}>
                          {question.difficulty}
                        </span>
                        <span className="text-muted-foreground">{question.points} points</span>
                        <span className="text-muted-foreground">{question.testCases.length} test cases</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => editQuestion(question)}
                        className="text-primary hover:text-primary/80"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => removeQuestion(question.id)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(true)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Add Another Question
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Creating Contest...' : 'Create Contest'}
          </button>
        </div>
      </form>
      
      {/* Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {currentQuestion.id ? 'Edit Question' : 'Add New Question'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="questionTitle" className="block text-sm font-medium text-muted-foreground mb-1">
                    Question Title *
                  </label>
                  <input
                    type="text"
                    id="questionTitle"
                    value={currentQuestion.title}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, title: e.target.value})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-foreground"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="questionDescription" className="block text-sm font-medium text-muted-foreground mb-1">
                    Description *
                  </label>
                  <textarea
                    id="questionDescription"
                    value={currentQuestion.description}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, description: e.target.value})}
                    rows={5}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-foreground"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="questionDifficulty" className="block text-sm font-medium text-muted-foreground mb-1">
                      Difficulty
                    </label>
                    <select
                      id="questionDifficulty"
                      value={currentQuestion.difficulty}
                      onChange={(e) => setCurrentQuestion({
                        ...currentQuestion,
                        difficulty: e.target.value as 'Easy' | 'Medium' | 'Hard'
                      })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-foreground"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="questionPoints" className="block text-sm font-medium text-muted-foreground mb-1">
                      Points
                    </label>
                    <input
                      type="number"
                      id="questionPoints"
                      value={currentQuestion.points}
                      onChange={(e) => setCurrentQuestion({
                        ...currentQuestion,
                        points: parseInt(e.target.value) || 0
                      })}
                      min="0"
                      className="w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-foreground"
                    />
                  </div>
                </div>
                
                {/* Test Cases Section */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-foreground">Test Cases</h3>
                    <button
                      type="button"
                      onClick={() => setEditingTestCase(true)}
                      className="text-sm text-primary hover:text-primary/80"
                    >
                      Add Test Case
                    </button>
                  </div>
                  
                  {currentQuestion.testCases.length === 0 ? (
                    <div className="text-center py-4 bg-muted rounded-md border border-border">
                      <p className="text-muted-foreground">No test cases added yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {currentQuestion.testCases.map((testCase, index) => (
                        <div key={testCase.id} className="border border-border rounded-md p-3 bg-muted">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-foreground">Test Case #{index + 1}</h4>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={() => editTestCase(testCase)}
                                className="text-xs text-primary hover:text-primary/80"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => removeTestCase(testCase.id)}
                                className="text-xs text-destructive hover:text-destructive/80"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                          <div className="mt-2 text-sm">
                            <div>
                              <span className="font-medium text-foreground">Input:</span>
                              <pre className="mt-1 bg-background p-2 rounded-md overflow-x-auto whitespace-pre-wrap text-foreground">
                                {testCase.input}
                              </pre>
                            </div>
                            <div className="mt-2">
                              <span className="font-medium text-foreground">Expected Output:</span>
                              <pre className="mt-1 bg-background p-2 rounded-md overflow-x-auto whitespace-pre-wrap text-foreground">
                                {testCase.expectedOutput}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setEditingQuestion(false)}
                    className="px-4 py-2 border border-border rounded-md text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    {currentQuestion.id ? 'Update Question' : 'Add Question'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Test Case Modal */}
      {editingTestCase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {currentTestCase.id ? 'Edit Test Case' : 'Add New Test Case'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="testInput" className="block text-sm font-medium text-muted-foreground mb-1">
                    Input *
                  </label>
                  <textarea
                    id="testInput"
                    value={currentTestCase.input}
                    onChange={(e) => setCurrentTestCase({...currentTestCase, input: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-foreground font-mono"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter input exactly as it would be provided to the program
                  </p>
                </div>
                
                <div>
                  <label htmlFor="testOutput" className="block text-sm font-medium text-muted-foreground mb-1">
                    Expected Output *
                  </label>
                  <textarea
                    id="testOutput"
                    value={currentTestCase.expectedOutput}
                    onChange={(e) => setCurrentTestCase({...currentTestCase, expectedOutput: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-foreground font-mono"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter expected output exactly as it should be produced by a correct solution
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setEditingTestCase(false)}
                    className="px-4 py-2 border border-border rounded-md text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={addTestCase}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    {currentTestCase.id ? 'Update Test Case' : 'Add Test Case'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateContest; 