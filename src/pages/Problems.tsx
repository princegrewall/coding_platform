
import React, { useState } from 'react';
import { problems } from '@/utils/problemsData';
import ProblemCard from '@/components/ProblemCard';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Difficulty = 'All' | 'Easy' | 'Medium' | 'Hard';

const Problems = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty>('All');

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'All' || problem.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="container-custom py-10 animate-fade-in">
      <div className="flex flex-col space-y-2 mb-8">
        <h1 className="text-3xl font-semibold">Problems</h1>
        <p className="text-muted-foreground">
          Browse and solve our collection of coding challenges
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search problems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 focus-ring"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-muted-foreground" />
          <Select 
            value={difficultyFilter} 
            onValueChange={(value) => setDifficultyFilter(value as Difficulty)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Levels</SelectItem>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {filteredProblems.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 animate-fade-in">
          {filteredProblems.map((problem) => (
            <ProblemCard key={problem.id} problem={problem} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No problems found</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your search or filter to find what you're looking for.
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchQuery('');
              setDifficultyFilter('All');
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default Problems;
