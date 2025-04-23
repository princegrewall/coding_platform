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
        } else {
          setError(response.data.message || 'Failed to fetch contest');
        }
      } catch (err: any) {
        console.error('Error fetching contest:', err);
        setError(err.response?.data?.message || 'An error occurred while fetching the contest');
        
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      ) : contest ? (
        <>
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">{contest.name}</h1>
              <div className="flex space-x-4">
                <Link
                  to={`/contest/${contestId}/leaderboard`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Leaderboard
                </Link>
              </div>
            </div>
            
            <div className="mt-2 text-gray-600">
              {contest.description}
            </div>
            
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-500">Start Time</div>
                <div className="mt-1">{new Date(contest.startTime).toLocaleString()}</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-500">End Time</div>
                <div className="mt-1">{new Date(contest.endTime).toLocaleString()}</div>
              </div>
              
              <div className={`
                bg-white p-4 rounded-lg shadow-sm border border-gray-200
                ${contestStatus === 'active' ? 'border-green-300' :
                   contestStatus === 'upcoming' ? 'border-blue-300' : 'border-red-300'}
              `}>
                <div className={`text-sm 
                  ${contestStatus === 'active' ? 'text-green-600' :
                     contestStatus === 'upcoming' ? 'text-blue-600' : 'text-red-600'}
                `}>
                  {contestStatus === 'active' ? 'Time Remaining' :
                   contestStatus === 'upcoming' ? 'Starts In' : 'Contest Ended'}
                </div>
                <div className="mt-1 font-semibold">
                  {timeLeft}
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-500">Participants</div>
                <div className="mt-1">{contest.participants.length}</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-500">Questions</div>
                <div className="mt-1">{contest.questions.length}</div>
              </div>
            </div>
          </div>
          
          {contestStatus === 'upcoming' ? (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    This contest hasn't started yet. Please wait until the start time to view the problems.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-4">Problems</h2>
              
              {contestStatus === 'ended' && (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        This contest has ended. You can still view the problems, but new submissions are not accepted.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Problem
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Difficulty
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Points
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contest.questions.map((question) => {
                      const isSolved = solvedQuestions.includes(question._id);
                      return (
                        <tr key={question._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{question.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {formatDifficulty(question.difficulty)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{question.points}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <Link
                              to={`/contest/${contestId}/problem/${question._id}`}
                              className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md 
                                ${isSolved
                                  ? 'text-white bg-green-600 hover:bg-green-700' 
                                  : contestStatus === 'active'
                                    ? 'text-white bg-blue-600 hover:bg-blue-700' 
                                    : 'text-blue-700 bg-blue-100 hover:bg-blue-200'}`
                              }
                            >
                              {isSolved 
                                ? 'Solved' 
                                : contestStatus === 'active' 
                                  ? 'Solve' 
                                  : 'View'}
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>No contest data available</p>
        </div>
      )}
    </div>
  );
};

export default ContestDetail; 