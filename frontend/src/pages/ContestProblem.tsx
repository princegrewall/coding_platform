import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../utils/authContext';
import CodeEditor from '../components/CodeEditor';
import { updateProblemStatus } from '@/utils/problemsData';

interface TestCase {
  input: string;
  expectedOutput: string;
}

interface Question {
  _id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  testCases: TestCase[];
  points: number;
}

interface Contest {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
}

const ContestProblem: React.FC = () => {
  const { contestId, questionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<Question | null>(null);
  const [contest, setContest] = useState<Contest | null>(null);
  const [isSolved, setIsSolved] = useState(false);
  
  // API base URL
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4010';
  
  useEffect(() => {
    const fetchProblemAndContest = async () => {
      if (!user) {
        toast.error('You must be logged in to view contest problems');
        navigate('/login');
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch the question
        const questionResponse = await axios.get(
          `${API_URL}/questions/${questionId}`,
          { withCredentials: true }
        );
        
        if (!questionResponse.data.success) {
          toast.error('Failed to load problem');
          navigate(`/contest/${contestId}`);
          return;
        }
        
        // Fetch the contest
        const contestResponse = await axios.get(
          `${API_URL}/contests/${contestId}`,
          { withCredentials: true }
        );
        
        if (!contestResponse.data.success) {
          toast.error('Failed to load contest');
          navigate('/contests');
          return;
        }
        
        setQuestion(questionResponse.data.question);
        setContest(contestResponse.data.contest);
        
        // Check if the current user has already solved this question
        if (contestResponse.data.contest.participants) {
          const currentUserParticipant = contestResponse.data.contest.participants.find(
            (p: any) => p.userId === user.id || p.userId?._id === user.id
          );
          
          if (currentUserParticipant && currentUserParticipant.solvedQuestions) {
            setIsSolved(currentUserParticipant.solvedQuestions.includes(questionId));
          }
        }
      } catch (error: any) {
        console.error('Error fetching problem:', error);
        toast.error(error.response?.data?.message || 'Failed to load problem');
        navigate(`/contest/${contestId}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProblemAndContest();
  }, [contestId, questionId, navigate, API_URL, user]);
  
  const handleSolveSuccess = () => {
    setIsSolved(true);
    
    // Also update in localStorage for persistence
    if (questionId) {
      updateProblemStatus(questionId, true);
    }
    
    toast.success('Problem solved successfully!');
    navigate(`/contest/${contestId}`);
  };
  
  // Check if contest is active
  const isContestActive = (): boolean => {
    if (!contest) return false;
    
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);
    
    return now >= start && now <= end;
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!question || !contest) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/20 border border-destructive text-destructive-foreground px-4 py-3 rounded">
          <p>Problem not found</p>
        </div>
        <Link to={`/contest/${contestId}`} className="mt-4 inline-block text-primary hover:text-primary/80">
          Back to Contest
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Contest and problem navigation */}
      <div className="mb-6">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Link to="/contests" className="hover:text-primary">Contests</Link>
          <span className="mx-2">›</span>
          <Link to={`/contest/${contestId}`} className="hover:text-primary">{contest.name}</Link>
          <span className="mx-2">›</span>
          <span className="text-foreground">{question.title}</span>
        </div>
        
        {!isContestActive() && (
          <div className="bg-yellow-500/10 border-l-4 border-yellow-500 text-yellow-400 p-4 mb-4">
            <p className="font-bold">Contest {new Date() < new Date(contest.startTime) ? 'has not started yet' : 'has ended'}</p>
            <p>
              {new Date() < new Date(contest.startTime) 
                ? 'You can view this problem, but submissions will only be accepted during the contest.' 
                : 'You can still view the problem, but new submissions are not accepted.'}
            </p>
          </div>
        )}
      </div>
      
      {/* Problem header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold text-foreground">{question.title}</h1>
          <span className={`
            px-3 py-1 rounded-full text-sm font-medium
            ${question.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' : 
              question.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 
              'bg-destructive/20 text-destructive-foreground'}
          `}>
            {question.difficulty}
          </span>
        </div>
        <div className="mt-2 text-muted-foreground">
          <span className="mr-4">{question.points} points</span>
        </div>
      </div>
      
      {/* Problem description */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 order-2 lg:order-1">
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Description</h2>
            <div className="prose max-w-none text-foreground">
              <p className="whitespace-pre-wrap">{question.description}</p>
            </div>
            
            {question.testCases && question.testCases.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3 text-foreground">Examples</h3>
                <div className="space-y-4">
                  {question.testCases.map((testCase, index) => (
                    <div key={index} className="border border-border rounded-md p-4">
                      <div className="mb-2">
                        <span className="font-medium text-foreground">Input:</span>
                        <pre className="mt-1 bg-muted p-2 rounded-md overflow-x-auto whitespace-pre-wrap text-foreground">
                          {testCase.input}
                        </pre>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Expected Output:</span>
                        <pre className="mt-1 bg-muted p-2 rounded-md overflow-x-auto whitespace-pre-wrap text-foreground">
                          {testCase.expectedOutput}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-3 order-1 lg:order-2">
          <CodeEditor 
            problem={{
              id: question._id,
              title: question.title,
              testCases: question.testCases,
              contestId: contestId,
              solved: isSolved
            }}
            onSolve={handleSolveSuccess}
            isContestActive={isContestActive()}
          />
        </div>
      </div>
    </div>
  );
};

export default ContestProblem; 