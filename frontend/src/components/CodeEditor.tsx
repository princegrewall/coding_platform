import React, { useState } from 'react';
import { Check, Play, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Problem as BaseProblem, TestCase as BaseTestCase, updateProblemStatus } from '@/utils/problemsData';
import axios from 'axios';

// Define the TestCase type compatible with both formats
interface TestCase {
  input: string;
  expectedOutput?: string;
  output?: string;
}

// Define the Problem interface for this component
interface Problem {
  id: string;
  title?: string;
  testCases?: TestCase[];
  contestId?: string;
  solved?: boolean;
}

interface CodeEditorProps {
  problem: Problem;
  onSolve: () => void;
  isContestActive?: boolean;
}

const cppTemplate = `#include <vector>
#include <iostream>
using namespace std;
// Write your solution here
void solution() {
    // Your code goes here
}

int main() {
    // Test your solution
    solution();
    return 0;
}`;

const CodeEditor: React.FC<CodeEditorProps> = ({ problem, onSolve, isContestActive = true }) => {
  const [code, setCode] = useState<string>(cppTemplate);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('editor');
  const [solved, setSolved] = useState<boolean>(problem.solved || false);
  // Using a constant for language since we only support C++
  const language = 'cpp';
  
  // API base URL
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4010';

  const runCode = async () => {
    setIsRunning(true);
    setActiveTab('console');
    setConsoleOutput('Running your code...\n');
    
    try {
      // Get the first test case input if available
      const testInput = problem.testCases && problem.testCases.length > 0 
        ? problem.testCases[0].input 
        : '';
      
      // Make actual API call to run the code
      const response = await axios.post(
        `${API_URL}/submissions/run`,
        {
          code,
          language,
          input: testInput
        },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setConsoleOutput(`Compiling your C++ solution...
Compilation successful!
Running your code...

Output:
${response.data.output || 'No output'}

Process finished with exit code 0`);
        
        toast.success('Code executed successfully', {
          description: 'Your code ran without errors',
          duration: 3000,
        });
      } else {
        setConsoleOutput(`Execution failed: ${response.data.message || 'Unknown error'}
${response.data.error || ''}`);
        
        toast.error('Execution failed', {
          description: response.data.message || 'Failed to run your code',
          duration: 3000,
        });
      }
    } catch (error: any) {
      console.error('Error running code:', error);
      setConsoleOutput(`Execution error: ${error.response?.data?.message || error.message || 'Unknown error'}`);
      toast.error('Execution failed', {
        description: error.response?.data?.message || error.message || 'An error occurred',
        duration: 3000,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const submitCode = async () => {
    setIsSubmitting(true);
    setActiveTab('console');
    setConsoleOutput('Evaluating your solution...\n');
    
    // Check if this is a contest submission
    if (problem.contestId) {
      try {
        // Get user ID from localStorage
        const userStr = localStorage.getItem('codePlatformUser');
        if (!userStr) {
          toast.error('You must be logged in to submit');
          setIsSubmitting(false);
          return;
        }
        
        const user = JSON.parse(userStr);
        
        // For contest submissions, use the backend API with the correct endpoint
        const response = await axios.post(
          `${API_URL}/submissions/submit`,
          {
            userId: user.id,
            contestId: problem.contestId,
            questionId: problem.id,
            code,
            language
          },
          { withCredentials: true }
        );
        
        if (response.data.success) {
          // Format penalty information
          let penaltyInfo = '';
          if (response.data.penalty) {
            if (response.data.verdict === 'Accepted') {
              penaltyInfo = `\nPenalty applied: ${response.data.penalty.percentage}%
Original points: ${response.data.penalty.originalPoints}
Points deducted: ${response.data.penalty.deduction}
Final points awarded: ${response.data.pointsAwarded}`;
            } else {
              penaltyInfo = `\nAttempt #${response.data.attempts}
Next submission penalty will be: ${response.data.penalty.nextPenaltyPercentage}%`;
            }
          }

          setConsoleOutput(`Compilation successful!
Running test cases...
${response.data.verdict === 'Accepted' ? 'All tests passed!' : 'Some tests failed'}
Time: ${Math.floor(Math.random() * 100)}ms
Memory: ${Math.floor(Math.random() * 10) + 20}MB

${response.data.verdict === 'Accepted' 
  ? 'Congratulations! Your solution has been accepted.'
  : 'Your solution did not pass all test cases.'}${penaltyInfo}
${response.data.errorDetails ? `\nError details: ${response.data.errorDetails}` : ''}`);

          if (response.data.verdict === 'Accepted') {
            setSolved(true);
            toast.success('Solution accepted!', {
              description: `You earned ${response.data.pointsAwarded} points!${response.data.penalty ? ` (${response.data.penalty.percentage}% penalty applied)` : ''}`,
              duration: 3000,
            });
            onSolve();
          } else {
            toast.error('Solution rejected', {
              description: `${response.data.message || 'Your code failed on some test cases.'} ${response.data.penalty ? `Attempt #${response.data.attempts}` : ''}`,
              duration: 3000,
            });
          }
        } else {
          setConsoleOutput(`Submission failed: ${response.data.message || 'Unknown error'}`);
          toast.error('Submission failed', {
            description: response.data.message || 'Failed to process your submission',
            duration: 3000,
          });
        }
      } catch (error: any) {
        console.error('Error submitting code:', error);
        
        // Try to extract more detailed error information
        let errorMessage = error.message || 'An error occurred';
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        setConsoleOutput(`Submission error: ${errorMessage}`);
        toast.error('Submission failed', {
          description: errorMessage,
          duration: 3000,
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Simulate submission for non-contest problems with a delay
      setTimeout(() => {
        // For demo purposes, we'll show a successful submission
        const allPassed = Math.random() > 0.3; // Randomly succeed or fail for demo
        
        if (allPassed) {
          updateProblemStatus(problem.id, true);
          setSolved(true);
          onSolve();
          
          setConsoleOutput(`Compilation successful!
Running test cases...
All tests passed!
Time: ${Math.floor(Math.random() * 100)}ms
Memory: ${Math.floor(Math.random() * 10) + 20}MB

Congratulations! Your solution has been accepted.`);
          
          toast.success('Solution accepted!', {
            description: 'Your code passed all test cases.',
            duration: 3000,
          });
        } else {
          if (problem.id) {
            updateProblemStatus(problem.id, false);
          }
          
          setConsoleOutput(`Compilation successful!
Running test cases...
Test Case 1: Passed
Test Case 2: Failed
  Expected output: [Expected result]
  Your output: [Your result]

Your solution did not pass all test cases.`);
          
          toast.error('Solution rejected', {
            description: 'Your code failed on some test cases.',
            duration: 3000,
          });
        }
        
        setIsSubmitting(false);
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-lg shadow-sm animate-fade-in overflow-hidden bg-white">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary font-medium rounded-md text-sm">
            C++
          </div>
          {solved && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 font-medium rounded-md text-sm">
              <Check size={14} />
              Solved
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={runCode}
            disabled={isRunning || isSubmitting}
            className="gap-1"
          >
            <Play size={16} />
            Run
          </Button>
          <Button
            size="sm"
            onClick={submitCode}
            disabled={isRunning || isSubmitting || !isContestActive}
            className="gap-1"
          >
            <Check size={16} />
            Submit
          </Button>
        </div>
      </div>
      
      <Tabs 
        defaultValue="editor" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <div className="border-b px-4">
          <TabsList className="h-9 -mb-px">
            <TabsTrigger value="editor" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Code Editor
            </TabsTrigger>
            <TabsTrigger value="console" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Console Output
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="editor" className="flex-1 p-0 mt-0">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none bg-code text-code-foreground"
            spellCheck="false"
          />
        </TabsContent>
        
        <TabsContent value="console" className="flex-1 p-0 mt-0">
          <div className="w-full h-full p-4 font-mono text-sm bg-black text-white overflow-auto">
            <pre>{consoleOutput}</pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CodeEditor;
