import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../utils/authContext';

interface TestCase {
  input: string;
  expectedOutput: string;
}

interface Question {
  _id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  testCases: TestCase[];
}

interface Contest {
  _id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  questions: Question[];
  participants: {
    userId: string;
    points: number;
  }[];
}

const ContestDetail: React.FC = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [contestStatus, setContestStatus] = useState<'upcoming' | 'active' | 'ended'>('upcoming');
  const [solvedQuestions, setSolvedQuestions] = useState<string[]>([]);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  
  // API base URL
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4010';
  
  // Fetch contest data
  useEffect(() => {
    const fetchContest = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_URL}/contests/${contestId}`,
          { withCredentials: true }
        );
        
        if (response.data.success) {
          setContest(response.data.contest);
          
          // Check if the current user has solved any questions in this contest
          if (user && response.data.contest.participants) {
            const currentUserParticipant = response.data.contest.participants.find(
              (p: any) => p.userId === user.id || p.userId?._id === user.id
            );
            
            if (currentUserParticipant && currentUserParticipant.solvedQuestions) {
              setSolvedQuestions(currentUserParticipant.solvedQuestions);
            }
          }

          // Check if contest has ended
          const now = new Date();
          const endTime = new Date(response.data.contest.endTime);
          if (now > endTime) {
            setContestStatus('ended');
            setIsPracticeMode(true);
          }
        } else {
          setError(response.data.message || 'Failed to fetch contest');
        }
      } catch (err: any) {
        console.error('Error fetching contest:', err);
        setError(err.response?.data?.message || 'An error occurred while fetching contest');
        
        // If not authorized, redirect to login
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (contestId) {
      fetchContest();
    }
  }, [contestId, navigate, API_URL, user]);
  
  // Timer effect to update contest status and time left
  useEffect(() => {
    if (!contest) return;
    
    const updateContestStatus = () => {
      const now = new Date();
      const startTime = new Date(contest.startTime);
      const endTime = new Date(contest.endTime);
      
      if (now < startTime) {
        // Contest hasn't started yet
        setContestStatus('upcoming');
        const diffMs = startTime.getTime() - now.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        
        setTimeLeft(`${diffDays}d ${diffHours}h ${diffMinutes}m ${diffSeconds}s`);
      } else if (now >= startTime && now <= endTime) {
        // Contest is active
        setContestStatus('active');
        const diffMs = endTime.getTime() - now.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        
        setTimeLeft(`${diffHours}h ${diffMinutes}m ${diffSeconds}s`);
      } else {
        // Contest has ended
        setContestStatus('ended');
        setTimeLeft('Contest has ended');
      }
    };
    
    // Update immediately
    updateContestStatus();
    
    // Then update every second
    const interval = setInterval(updateContestStatus, 1000);
    
    return () => clearInterval(interval);
  }, [contest]);
  
  // Format difficulty to display with appropriate color
  const formatDifficulty = (difficulty: string) => {
    let bgColor = '';
    let textColor = '';
    
    switch (difficulty) {
      case 'Easy':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'Medium':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      case 'Hard':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {difficulty}
      </span>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-destructive/20 border border-destructive text-destructive-foreground px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      ) : contest ? (
        <div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{contest.name}</h1>
              <p className="mt-2 text-muted-foreground">{contest.description}</p>
            </div>
            {isPracticeMode && (
              <div className="bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-md">
                Practice Mode
              </div>
            )}
          </div>

          {/* Questions List */}
          <div className="space-y-4">
          {contestStatus === 'upcoming' ? (
              <div className="mt-8 text-center text-yellow-500 font-semibold">
                The contest hasn't started yet. Please wait until it begins to view the problems.
              </div>
            ) : (
              <div className="space-y-4">
                {contest.questions.map((question, index) => (
                  <div
                    key={question._id}
                    className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/contest/${contestId}/problem/${question._id}`)}
                  >
                    {/* Existing question content */}
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {index + 1}. {question.title}
                        </h3>
                        <div className="flex items-center space-x-4 mt-2">
                          <p className="text-sm text-muted-foreground">
                            Points: {question.points}
                          </p>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                            question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {question.difficulty}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {solvedQuestions.includes(question._id) && (
                          <span className="text-green-500 flex items-center">
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Solved
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/contest/${contestId}/problem/${question._id}`);
                          }}
                          className={`px-4 py-2 rounded-md ${
                            isPracticeMode
                              ? 'bg-blue-500 text-white hover:bg-blue-600'
                              : 'bg-primary text-primary-foreground hover:bg-primary/90'
                          }`}
                        >
                          {isPracticeMode ? 'Practice' : 'Solve'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      ) : (
        <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-400 px-4 py-3 rounded">
          <p>No contest data available</p>
        </div>
      )}
    </div>
  );
};

export default ContestDetail; 