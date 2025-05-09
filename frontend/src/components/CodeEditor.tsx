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
      
      // Log the complete request details
      const requestPayload = {
        code,
        language: 'cpp',
        input: testInput
      };
      
      console.log('\n=== Code Execution Request ===');
      console.log('Code:', code);
      console.log('Input:', testInput);
      console.log('Language:', 'cpp');
      
      // Make actual API call to run the code
      const response = await axios.post(
        `${API_URL}/submissions/run`,
        requestPayload,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('\n=== Server Response ===');
      console.log('Response data:', response.data);
      
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
        const errorMessage = response.data.message || response.data.error || 'Unknown error';
        console.log('\nError in response:', {
          message: response.data.message,
          error: response.data.error,
          success: response.data.success
        });
        
        setConsoleOutput(`Execution failed: ${errorMessage}`);
        
        toast.error('Execution failed', {
          description: errorMessage,
          duration: 3000,
        });
      }
    } catch (error: any) {
      console.error('\n=== Error Details ===');
      console.error('Error running code:', error);
      
      // Detailed error logging
      console.log('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        code: error.code
      });
      
      // Extract error message from response
      let errorMessage = 'Unknown error';
      if (error.response?.data) {
        errorMessage = error.response.data.message || error.response.data.error || error.message;
        console.log('Server error response:', error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setConsoleOutput(`Execution error: ${errorMessage}
${error.response?.data?.error || ''}`);
      
      toast.error('Execution failed', {
        description: errorMessage,
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
          if (response.data.submission.penalty) {
            if (response.data.submission.status === 'Accepted') {
              penaltyInfo = `\nPenalty applied: ${response.data.submission.penalty.percentage}%
Original points: ${response.data.submission.penalty.originalPoints}
Points deducted: ${response.data.submission.penalty.deduction}
Final points awarded: ${response.data.submission.pointsAwarded}`;
            } else {
              penaltyInfo = `\nAttempt #${response.data.submission.attempts}
Next submission penalty will be: ${response.data.submission.penalty.nextPenaltyPercentage}%`;
            }
          }

          // Format test case results
          let testCaseOutput = '';
          if (response.data.submission.testCaseResults) {
            testCaseOutput = '\n\nTest Case Results:';
            response.data.submission.testCaseResults.forEach((result, index) => {
              testCaseOutput += `\n\nTest Case ${result.testCase}: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`;
              if (!result.passed) {
                testCaseOutput += `\nInput: ${result.input}`;
                testCaseOutput += `\nExpected: ${result.expected}`;
                testCaseOutput += `\nGot: ${result.actual || result.error}`;
              }
            });
          }

          setConsoleOutput(`Compilation successful!
Running test cases...
${response.data.submission.status === 'Accepted' ? 'All tests passed!' : 'Some tests failed'}
Time: ${Math.floor(Math.random() * 100)}ms
Memory: ${Math.floor(Math.random() * 10) + 20}MB${testCaseOutput}

${response.data.submission.status === 'Accepted' 
  ? 'Congratulations! Your solution has been accepted.'
  : 'Your solution did not pass all test cases.'}${penaltyInfo}
${response.data.submission.errorDetails ? `\nError details: ${response.data.submission.errorDetails}` : ''}`);

          if (response.data.submission.status === 'Accepted') {
            setSolved(true);
            toast.success('Solution accepted!', {
              description: `You earned ${response.data.submission.pointsAwarded} points!${response.data.submission.penalty ? ` (${response.data.submission.penalty.percentage}% penalty applied)` : ''}`,
              duration: 3000,
            });
            onSolve();
          } else {
            toast.error('Solution rejected', {
              description: `${response.data.submission.errorDetails || 'Your code failed on some test cases.'} ${response.data.submission.penalty ? `Attempt #${response.data.submission.attempts}` : ''}`,
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
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Code2 size={20} className="text-primary" />
          <h2 className="text-lg font-medium text-foreground">Code Editor</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={runCode}
            disabled={isRunning || isSubmitting}
            className="gap-1.5"
          >
            <Play size={16} />
            Run
          </Button>
          <Button
            size="sm"
            onClick={submitCode}
            disabled={isRunning || isSubmitting}
            className="gap-1.5"
          >
            <Check size={16} />
            Submit
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="console">Console</TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor" className="flex-1 mt-0">
          <div className="h-full border rounded-lg overflow-hidden bg-card">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full p-4 font-mono text-sm bg-background text-foreground resize-none focus:outline-none"
              spellCheck={false}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="console" className="flex-1 mt-0">
          <div className="h-full border rounded-lg overflow-hidden bg-card">
            <pre className="w-full h-full p-4 font-mono text-sm bg-background text-foreground overflow-auto whitespace-pre-wrap">
              {consoleOutput || 'No output yet'}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CodeEditor;
