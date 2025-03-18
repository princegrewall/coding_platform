
import React, { useState } from 'react';
import { Check, Play, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Problem, TestCase, updateProblemStatus } from '@/utils/problemsData';

interface CodeEditorProps {
  problem: Problem;
  onSolve: () => void;
}

type Language = 'python' | 'cpp' | 'java';

const languageTemplates: Record<Language, string> = {
  python: `def solution(nums, target):
    # Write your solution here
    pass

# Example usage:
# solution([2, 7, 11, 15], 9)`,
  cpp: `#include <vector>

std::vector<int> solution(std::vector<int>& nums, int target) {
    // Write your solution here
    return {};
}

// Example usage:
// solution({2, 7, 11, 15}, 9);`,
  java: `import java.util.*;

class Solution {
    public int[] solution(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }
    
    // Example usage:
    // solution(new int[]{2, 7, 11, 15}, 9);
}`
};

const CodeEditor: React.FC<CodeEditorProps> = ({ problem, onSolve }) => {
  const [code, setCode] = useState<string>(languageTemplates.python);
  const [language, setLanguage] = useState<Language>('python');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('editor');

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setCode(languageTemplates[lang]);
  };

  const runCode = () => {
    setIsRunning(true);
    setActiveTab('console');
    setConsoleOutput('Running your code...\n');
    
    // Simulate code execution with a delay
    setTimeout(() => {
      // For demo purposes, we'll show sample output
      const output = `Test Case 1:
Input: ${problem.testCases[0].input}
Expected Output: ${problem.testCases[0].output}
Your Output: ${problem.testCases[0].output}
Result: Passed ✓

Test Case 2:
Input: ${problem.testCases[1].input}
Expected Output: ${problem.testCases[1].output}
Your Output: ${problem.testCases[1].output}
Result: Passed ✓`;
      
      setConsoleOutput(output);
      setIsRunning(false);
      
      toast.success('Code executed successfully', {
        description: 'All test cases passed!',
        duration: 3000,
      });
    }, 1500);
  };

  const submitCode = () => {
    setIsSubmitting(true);
    setActiveTab('console');
    setConsoleOutput('Evaluating your solution...\n');
    
    // Simulate submission with a delay
    setTimeout(() => {
      // For demo purposes, we'll show a successful submission
      const allPassed = Math.random() > 0.3; // Randomly succeed or fail for demo
      
      if (allPassed) {
        updateProblemStatus(problem.id, true);
        onSolve();
        
        setConsoleOutput(`${problem.testCases.length} test cases executed.
All tests passed!
Time: ${Math.floor(Math.random() * problem.timeLimit)}ms
Memory: ${Math.floor(Math.random() * problem.memoryLimit)}MB

Congratulations! Your solution has been accepted.`);
        
        toast.success('Solution accepted!', {
          description: 'Your code passed all test cases.',
          duration: 3000,
        });
      } else {
        updateProblemStatus(problem.id, false);
        
        setConsoleOutput(`Test Case 1:
Input: ${problem.testCases[0].input}
Expected Output: ${problem.testCases[0].output}
Your Output: ${problem.testCases[0].output}
Result: Passed ✓

Test Case 2:
Input: ${problem.testCases[1].input}
Expected Output: ${problem.testCases[1].output}
Your Output: "Wrong answer"
Result: Failed ✗

Your solution did not pass all test cases.`);
        
        toast.error('Solution rejected', {
          description: 'Your code failed on some test cases.',
          duration: 3000,
        });
      }
      
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full border rounded-lg shadow-sm animate-fade-in overflow-hidden bg-white">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className={language === 'python' ? 'bg-primary/10' : ''}
            onClick={() => handleLanguageChange('python')}
          >
            Python
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={language === 'cpp' ? 'bg-primary/10' : ''}
            onClick={() => handleLanguageChange('cpp')}
          >
            C++
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={language === 'java' ? 'bg-primary/10' : ''}
            onClick={() => handleLanguageChange('java')}
          >
            Java
          </Button>
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
            disabled={isRunning || isSubmitting}
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
