import React from 'react';
import { Link } from 'react-router-dom';
import { Problem, getProblemStatus } from '@/utils/problemsData';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProblemCardProps {
  problem: Problem;
}

const difficultyColors = {
  'Easy': 'text-green-600 bg-green-50',
  'Medium': 'text-amber-600 bg-amber-50',
  'Hard': 'text-red-600 bg-red-50',
};

const ProblemCard: React.FC<ProblemCardProps> = ({ problem }) => {
  const status = getProblemStatus(problem.id);
  const isSolved = status?.solved;

  return (
    <Link 
      to={`/problems/${problem.id}`}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-lg border p-5 transition-all duration-300 hover:border-primary/50 hover:shadow-sm animate-fade-in">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              {isSolved ? (
                <CheckCircle2 size={20} className="text-green-600" />
              ) : (
                <Circle size={20} className="text-muted-foreground/60" />
              )}
              <h3 className="font-medium text-lg group-hover:text-primary transition-colors">
                {problem.title}
              </h3>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {problem.description.substring(0, 120).trim()}...
            </p>
          </div>

          <div className="flex flex-col items-end gap-2.5">
            <span className={cn(
              "text-xs px-2.5 py-1 rounded-full font-medium",
              difficultyColors[problem.difficulty]
            )}>
              {problem.difficulty}
            </span>
            
            <ChevronRight 
              size={18} 
              className="text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all" 
            />
          </div>
        </div>
        
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/[0.01] to-primary/[0.03] opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  );
};

export default ProblemCard;
