import React from 'react';
import { formatTime } from '../utils/formatTime';

interface LeaderboardEntry {
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
}

interface LeaderboardTableProps {
  leaderboard: LeaderboardEntry[];
  penaltyPerWrongSubmission?: number;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ 
  leaderboard,
  penaltyPerWrongSubmission = 300 // Default 5 minutes in seconds
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white text-left text-sm text-gray-700">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-4 font-medium text-gray-900">Rank</th>
            <th className="px-4 py-4 font-medium text-gray-900">Name</th>
            <th className="px-4 py-4 font-medium text-gray-900">Points</th>
            <th className="px-4 py-4 font-medium text-gray-900">Problems Solved</th>
            <th className="px-4 py-4 font-medium text-gray-900">Solving Time</th>
            <th className="px-4 py-4 font-medium text-gray-900">Wrong Submissions</th>
            <th className="px-4 py-4 font-medium text-gray-900">Penalty Time</th>
            <th className="px-4 py-4 font-medium text-gray-900">Total Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 border-t border-gray-100">
          {leaderboard.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-4">No participants yet</td>
            </tr>
          ) : (
            leaderboard.map((entry) => (
              <tr 
                key={entry.userId}
                className={`hover:bg-gray-50 ${entry.rank === 1 ? 'bg-yellow-50' : ''}`}
              >
                <td className="px-4 py-4">
                  <span className={`font-semibold ${entry.rank === 1 ? 'text-yellow-600' : ''}`}>
                    {entry.rank}
                  </span>
                </td>
                <td className="px-4 py-4">{entry.name}</td>
                <td className="px-4 py-4 font-medium">{entry.points}</td>
                <td className="px-4 py-4">{entry.problemsSolved}</td>
                <td className="px-4 py-4">{formatTime(entry.solvingTime)}</td>
                <td className="px-4 py-4">
                  {entry.wrongSubmissions > 0 ? (
                    <span className="text-red-600">{entry.wrongSubmissions}</span>
                  ) : (
                    <span className="text-green-600">0</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  {entry.penalties > 0 ? (
                    <span className="text-red-600">+{formatTime(entry.penalties)}</span>
                  ) : (
                    <span className="text-green-600">+00:00:00</span>
                  )}
                </td>
                <td className="px-4 py-4 font-medium">{formatTime(entry.totalTime)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {penaltyPerWrongSubmission && (
        <div className="text-xs text-gray-500 mt-4">
          <p>* Each wrong submission adds a {formatTime(penaltyPerWrongSubmission)} penalty to the total time.</p>
        </div>
      )}
    </div>
  );
};

export default LeaderboardTable; 