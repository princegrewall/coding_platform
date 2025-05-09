import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../utils/authContext';

interface Contest {
  _id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  questions: string[];
  participants: {
    userId: string;
    points: number;
  }[];
}

type ContestStatus = 'active' | 'upcoming' | 'past' | 'all';

const Contests: React.FC = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ContestStatus>('all');
  const { user } = useAuth();
  
  // API base URL
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4010';
  
  useEffect(() => {
    const fetchContests = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_URL}/contests`,
          { withCredentials: true }
        );
        
        if (response.data.success) {
          setContests(response.data.contests);
        } else {
          setError(response.data.message || 'Failed to fetch contests');
        }
      } catch (err: any) {
        console.error('Error fetching contests:', err);
        setError(err.response?.data?.message || 'An error occurred while fetching contests');
        
        // If not authorized, redirect to login
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchContests();
  }, [navigate, API_URL]);
  
  // Calculate contest status based on start and end times
  const getContestStatus = (startTime: string, endTime: string): ContestStatus => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (now < start) {
      return 'upcoming';
    } else if (now >= start && now <= end) {
      return 'active';
    } else {
      return 'past';
    }
  };
  
  // Filter contests based on their status
  const filteredContests = contests.filter(contest => {
    if (filter === 'all') return true;
    
    const status = getContestStatus(contest.startTime, contest.endTime);
    return status === filter;
  });
  
  // Calculate time remaining or time since start
  const getTimeDisplay = (startTime: string, endTime: string): string => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (now < start) {
      // Upcoming contest - show time until start
      const diffMs = start.getTime() - now.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (diffDays > 0) {
        return `Starts in ${diffDays}d ${diffHours}h`;
      } else {
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `Starts in ${diffHours}h ${diffMinutes}m`;
      }
    } else if (now >= start && now <= end) {
      // Active contest - show time until end
      const diffMs = end.getTime() - now.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      return `Ends in ${diffHours}h ${diffMinutes}m`;
    } else {
      // Past contest - show when it ended
      return `Ended ${end.toLocaleDateString()}`;
    }
  };
  
  // Check if a contest is joinable (upcoming or ongoing)
  const isContestJoinable = (startTime: string, endTime: string): boolean => {
    const now = new Date();
    const end = new Date(endTime);
    return now <= end;
  };
  
  // Join a contest
  const joinContest = async (contestId: string) => {
    if (!user) {
      toast.error('You must be logged in to join a contest');
      navigate('/login');
      return;
    }
    
    console.log('Joining contest with userId:', user.id);
    console.log('User object:', user);
    
    try {
      const response = await axios.post(
        `${API_URL}/contests/${contestId}/join`,
        { userId: user.id },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        toast.success('Successfully joined the contest');
        // Refresh the contests list
        const updatedContests = contests.map(contest => 
          contest._id === contestId 
            ? { ...contest, participants: [...contest.participants, { userId: user.id, points: 0 }] }
            : contest
        );
        setContests(updatedContests);
      } else {
        toast.error(response.data.message || 'Failed to join contest');
      }
    } catch (err: any) {
      console.error('Error joining contest:', err);
      toast.error(err.response?.data?.message || 'An error occurred while joining the contest');
    }
  };
  
  // Check if user has already joined a contest
  const hasJoinedContest = (contest: Contest): boolean => {
    if (!user) return false;
    return contest.participants.some(p => p.userId === user.id);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Contests</h1>
        <Link
          to="/contests/create"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Create Contest
        </Link>
      </div>
      
      {/* Filter tabs */}
      <div className="mb-6">
        <div className="border-b border-border">
          <nav className="-mb-px flex space-x-8">
            {['all', 'active', 'upcoming', 'past'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as ContestStatus)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${filter === status 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}
                `}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-destructive/20 border border-destructive text-destructive-foreground px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      ) : filteredContests.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground mb-4">No contests found</p>
          <Link
            to="/contests/create"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Create a New Contest
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContests.map((contest) => {
            const status = getContestStatus(contest.startTime, contest.endTime);
            const timeDisplay = getTimeDisplay(contest.startTime, contest.endTime);
            const isJoinable = isContestJoinable(contest.startTime, contest.endTime);
            const hasJoined = hasJoinedContest(contest);
            
            return (
              <div 
                key={contest._id} 
                className="border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-card cursor-pointer"
                onClick={() => navigate(`/contest/${contest._id}`)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-semibold text-foreground">{contest.name}</h2>
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${status === 'active' ? 'bg-green-500/10 text-green-400' : 
                        status === 'upcoming' ? 'bg-blue-500/10 text-blue-400' : 
                        'bg-muted text-muted-foreground'}
                    `}>
                      {status === 'active' ? 'Active' : 
                       status === 'upcoming' ? 'Upcoming' : 'Past'}
                    </span>
                  </div>
                  
                  <p className="mt-2 text-muted-foreground line-clamp-2">
                    {contest.description || 'No description provided'}
                  </p>
                  
                  <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {new Date(contest.startTime).toLocaleDateString()}, 
                        {new Date(contest.startTime).toLocaleTimeString()} - 
                        {new Date(contest.endTime).toLocaleDateString() === new Date(contest.startTime).toLocaleDateString()
                          ? new Date(contest.endTime).toLocaleTimeString()
                          : `${new Date(contest.endTime).toLocaleDateString()}, ${new Date(contest.endTime).toLocaleTimeString()}`}
                      </span>

                    </div>
                    <div className="flex items-center">
                      <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{timeDisplay}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>{contest.participants.length} Participants</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{contest.questions.length} Questions</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-between items-center">
                    <Link
                      to={`/contest/${contest._id}/leaderboard`}
                      className="text-primary hover:text-primary/80 text-sm font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Leaderboard
                    </Link>
                    
                    {isJoinable ? (
                      hasJoined ? (
                        <Link
                          to={`/contest/${contest._id}`}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Enter Contest
                        </Link>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            joinContest(contest._id);
                          }}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                          Join Contest
                        </button>
                      )
                    ) : (
                      <span className="text-muted-foreground text-sm">Contest Ended</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Contests; 