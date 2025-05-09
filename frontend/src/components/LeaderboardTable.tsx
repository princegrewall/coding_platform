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
      <table className="w-full border-collapse bg-card text-left text-sm text-foreground">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-4 font-medium text-foreground">Rank</th>
            <th className="px-4 py-4 font-medium text-foreground">Name</th>
            <th className="px-4 py-4 font-medium text-foreground">Points</th>
            <th className="px-4 py-4 font-medium text-foreground">Problems Solved</th>
            <th className="px-4 py-4 font-medium text-foreground">Solving Time</th>
            <th className="px-4 py-4 font-medium text-foreground">Wrong Submissions</th>
            <th className="px-4 py-4 font-medium text-foreground">Penalty Time</th>
            <th className="px-4 py-4 font-medium text-foreground">Total Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border border-t border-border">
          {leaderboard.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-4 text-muted-foreground">No participants yet</td>
            </tr>
          ) : (
            leaderboard.map((entry) => (
              <tr 
                key={entry.userId}
                className={`hover:bg-muted/50 ${entry.rank === 1 ? 'bg-yellow-500/10' : ''}`}
              >
                <td className="px-4 py-4">
                  <span className={`font-semibold ${entry.rank === 1 ? 'text-yellow-400' : ''}`}>
                    {entry.rank}
                  </span>
                </td>
                <td className="px-4 py-4">{entry.name}</td>
                <td className="px-4 py-4 font-medium">{entry.points}</td>
                <td className="px-4 py-4">{entry.problemsSolved}</td>
                <td className="px-4 py-4">{formatTime(entry.solvingTime)}</td>
                <td className="px-4 py-4">
                  {entry.wrongSubmissions > 0 ? (
                    <span className="text-destructive-foreground">{entry.wrongSubmissions}</span>
                  ) : (
                    <span className="text-green-400">0</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  {entry.penalties > 0 ? (
                    <span className="text-destructive-foreground">+{formatTime(entry.penalties)}</span>
                  ) : (
                    <span className="text-green-400">+00:00:00</span>
                  )}
                </td>
                <td className="px-4 py-4 font-medium">{formatTime(entry.totalTime)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {penaltyPerWrongSubmission && (
        <div className="text-xs text-muted-foreground mt-4">
          <p>* Each wrong submission adds a {formatTime(penaltyPerWrongSubmission)} penalty to the total time.</p>
        </div>
      )}
    </div>
  );
};

export default LeaderboardTable; 