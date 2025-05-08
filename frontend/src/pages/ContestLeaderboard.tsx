import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LeaderboardTable from '../components/LeaderboardTable';
import { formatTimeHuman } from '../utils/formatTime';

interface LeaderboardData {
  contestName: string;
  startTime: string;
  endTime: string;
  penaltyPerWrongSubmission: number;
  leaderboard: {
    rank: number;
    userId: string;
    name: string;
    email: string;
    points: number;
    problemsSolved: number;
    solvingTime: number;
    wrongSubmissions: number;
    penalties: number;
    totalTime: number;
  }[];
}

const ContestLeaderboard: React.FC = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const navigate = useNavigate();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // API base URL
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4010';

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        console.log('Fetching leaderboard for contest:', contestId);
        console.log('API URL:', `${API_URL}/leaderboard/contest/${contestId}`);
        
        // Get the stored user data
        const userStr = localStorage.getItem('codePlatformUser');
        if (!userStr) {
          console.error('No user data found in localStorage');
          navigate('/login');
          return;
        }

        const response = await axios.get(`${API_URL}/leaderboard/contest/${contestId}`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Leaderboard response:', response.data);
        
        if (response.data.success) {
          setLeaderboardData(response.data);
        } else {
          console.error('Failed to load leaderboard:', response.data);
          setError('Failed to load leaderboard data');
        }
      } catch (err: any) {
        console.error('Error fetching leaderboard:', err);
        console.error('Error details:', {
          status: err.response?.status,
          message: err.response?.data?.message,
          error: err.message
        });
        
        if (err.response?.status === 401) {
          console.log('Unauthorized, redirecting to login');
          // Clear any stale auth data
          localStorage.removeItem('codePlatformUser');
          navigate('/login');
        } else {
          setError(err.response?.data?.message || 'An error occurred while fetching the leaderboard');
        }
      } finally {
        setLoading(false);
      }
    };

    if (contestId) {
      fetchLeaderboard();
    } else {
      console.error('No contest ID provided');
      setError('No contest ID provided');
      setLoading(false);
    }
  }, [contestId, navigate, API_URL]);

  // Calculate if the contest is ongoing, ended, or upcoming
  const getContestStatus = () => {
    if (!leaderboardData) return null;
    
    const now = new Date();
    const startTime = new Date(leaderboardData.startTime);
    const endTime = new Date(leaderboardData.endTime);
    
    if (now < startTime) {
      return { status: 'upcoming', text: 'Upcoming' };
    } else if (now >= startTime && now <= endTime) {
      return { status: 'ongoing', text: 'Ongoing' };
    } else {
      return { status: 'ended', text: 'Ended' };
    }
  };

  const contestStatus = getContestStatus();

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
      ) : leaderboardData ? (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{leaderboardData.contestName} - Leaderboard</h1>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              <div>
                <span className="font-semibold">Start:</span> {new Date(leaderboardData.startTime).toLocaleString()}
              </div>
              <div>
                <span className="font-semibold">End:</span> {new Date(leaderboardData.endTime).toLocaleString()}
              </div>
              {contestStatus && (
                <div>
                  <span className="font-semibold">Status:</span> 
                  <span className={`ml-1 ${
                    contestStatus.status === 'ongoing' ? 'text-green-600' : 
                    contestStatus.status === 'upcoming' ? 'text-blue-600' : 'text-red-600'
                  }`}>
                    {contestStatus.text}
                  </span>
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <p className="text-sm text-blue-700">
                <span className="font-semibold">Note:</span> Each wrong submission adds a penalty of {formatTimeHuman(leaderboardData.penaltyPerWrongSubmission)} to the total time.
              </p>
            </div>
          </div>

          <LeaderboardTable
            leaderboard={leaderboardData.leaderboard}
            penaltyPerWrongSubmission={leaderboardData.penaltyPerWrongSubmission}
          />
        </>
      ) : (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>No leaderboard data available</p>
        </div>
      )}
    </div>
  );
};

export default ContestLeaderboard; 