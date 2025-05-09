import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Problem, problems, getProblemStatus, updateProblemStatus } from '@/utils/problemsData';
import CodeEditor from '@/components/CodeEditor';
import { ArrowLeft, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const difficultyColors = {
  'Easy': 'text-green-400 bg-green-500/20',
  'Medium': 'text-yellow-400 bg-yellow-500/20',
  'Hard': 'text-destructive-foreground bg-destructive/20',
};

const ProblemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSolved, setIsSolved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Find the problem by ID
    const foundProblem = problems.find(p => p.id === id);
    
    if (foundProblem) {
      setProblem(foundProblem);
      // Check if problem is already solved
      const status = getProblemStatus(foundProblem.id);
      setIsSolved(status?.solved || false);
    } else {
      toast.error('Problem not found', {
        description: 'The problem you are looking for does not exist.',
        duration: 3000,
      });
    }
    
    setLoading(false);
  }, [id]);

  const handleProblemSolved = () => {
    setIsSolved(true);
    if (problem) {
      updateProblemStatus(problem.id, true);
    }
    toast.success('Problem solved!', {
      description: 'Great job on solving this challenge.',
      duration: 3000,
    });
  };

  if (loading) {
    return (
      <div className="container-custom py-10 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">Loading problem...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="container-custom py-10 animate-fade-in">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <AlertCircle size={48} className="text-muted-foreground" />
          <h2 className="text-2xl font-semibold">Problem Not Found</h2>
          <p className="text-muted-foreground">
            The problem you are looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/problems')}>
            Back to Problems
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-6 animate-fade-in">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/problems')}
          className="group mb-4"
        >
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Problems
        </Button>
        
        <div className="flex items-center space-x-3 mb-2">
          {isSolved ? (
            <CheckCircle2 size={20} className="text-green-400" />
          ) : (
            <Circle size={20} className="text-muted-foreground/60" />
          )}
          
          <h1 className="text-2xl font-semibold text-foreground">{problem.title}</h1>
          
          <span className={cn(
            "text-xs px-2.5 py-1 rounded-full font-medium",
            difficultyColors[problem.difficulty]
          )}>
            {problem.difficulty}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-14rem)]">
        {/* Problem statement */}
        <div className="flex flex-col h-full overflow-hidden">
          <div className="border rounded-lg bg-card shadow-sm flex-1 overflow-auto">
            <div className="p-6">
              <div className="prose max-w-none">
                <h3 className="text-lg font-medium mb-4">Problem Description</h3>
                <div className="whitespace-pre-line">{problem.description}</div>
                
                <h3 className="text-lg font-medium mb-2 mt-6">Constraints</h3>
                <ul className="list-disc pl-6 space-y-1">
                  {problem.constraints.map((constraint, index) => (
                    <li key={index} className="text-sm">{constraint}</li>
                  ))}
                </ul>
                
                <h3 className="text-lg font-medium mb-2 mt-6">Examples</h3>
                {problem.examples.map((example, index) => (
                  <div key={index} className="mb-4 bg-muted/50 rounded-lg p-4 text-sm">
                    <div className="mb-2">
                      <strong>Input:</strong> <code>{example.input}</code>
                    </div>
                    <div className="mb-2">
                      <strong>Output:</strong> <code>{example.output}</code>
                    </div>
                    {example.explanation && (
                      <div>
                        <strong>Explanation:</strong> {example.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Code editor */}
        <div className="flex flex-col h-full">
          <CodeEditor 
            problem={{...problem, solved: isSolved}} 
            onSolve={handleProblemSolved} 
          />
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;
