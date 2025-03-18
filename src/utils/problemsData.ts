export interface TestCase {
  input: string;
  output: string;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation: string;
  }[];
  testCases: TestCase[];
  timeLimit: number;
  memoryLimit: number;
}

export interface UserProblemStatus {
  problemId: string;
  solved: boolean;
  attempts: number;
  lastAttemptDate?: Date;
}

// Sample problems data
export const problems: Problem[] = [
  {
    id: '1',
    title: 'Two Sum',
    difficulty: 'Easy',
    description: `
Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.
    `,
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].',
      },
    ],
    testCases: [
      {
        input: '[2,7,11,15]\n9',
        output: '[0,1]',
      },
      {
        input: '[3,2,4]\n6',
        output: '[1,2]',
      },
    ],
    timeLimit: 1000,
    memoryLimit: 128,
  },
  {
    id: '2',
    title: 'Reverse String',
    difficulty: 'Easy',
    description: `
Write a function that reverses a string. The input string is given as an array of characters \`s\`.

You must do this by modifying the input array in-place with O(1) extra memory.
    `,
    constraints: [
      '1 <= s.length <= 10^5',
      's[i] is a printable ascii character.',
    ],
    examples: [
      {
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
        explanation: 'Reverse the characters in the array.',
      },
      {
        input: 's = ["H","a","n","n","a","h"]',
        output: '["h","a","n","n","a","H"]',
        explanation: 'Reverse the characters in the array.',
      },
    ],
    testCases: [
      {
        input: '["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
      },
      {
        input: '["H","a","n","n","a","h"]',
        output: '["h","a","n","n","a","H"]',
      },
    ],
    timeLimit: 500,
    memoryLimit: 64,
  },
  {
    id: '3',
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    description: `
Given an integer array \`nums\`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.

A subarray is a contiguous part of an array.
    `,
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
    ],
    examples: [
      {
        input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        explanation: '[4,-1,2,1] has the largest sum = 6.',
      },
      {
        input: 'nums = [1]',
        output: '1',
        explanation: 'The subarray [1] has the largest sum 1.',
      },
    ],
    testCases: [
      {
        input: '[-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
      },
      {
        input: '[1]',
        output: '1',
      },
    ],
    timeLimit: 1000,
    memoryLimit: 128,
  },
  {
    id: '4',
    title: 'Merge Sorted Arrays',
    difficulty: 'Easy',
    description: `
You are given two integer arrays \`nums1\` and \`nums2\`, sorted in non-decreasing order, and two integers \`m\` and \`n\`, representing the number of elements in \`nums1\` and \`nums2\` respectively.

Merge \`nums1\` and \`nums2\` into a single array sorted in non-decreasing order.

The final sorted array should not be returned by the function, but instead be stored inside the array \`nums1\`. To accommodate this, \`nums1\` has a length of \`m + n\`, where the first \`m\` elements denote the elements that should be merged, and the last \`n\` elements are set to 0 and should be ignored. \`nums2\` has a length of \`n\`.
    `,
    constraints: [
      'nums1.length == m + n',
      'nums2.length == n',
      '0 <= m, n <= 200',
      '1 <= m + n <= 200',
      '-10^9 <= nums1[i], nums2[j] <= 10^9',
    ],
    examples: [
      {
        input: 'nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3',
        output: '[1,2,2,3,5,6]',
        explanation: 'The arrays we are merging are [1,2,3] and [2,5,6]. The result of the merge is [1,2,2,3,5,6].',
      },
      {
        input: 'nums1 = [1], m = 1, nums2 = [], n = 0',
        output: '[1]',
        explanation: 'The arrays we are merging are [1] and []. The result of the merge is [1].',
      },
    ],
    testCases: [
      {
        input: '[1,2,3,0,0,0]\n3\n[2,5,6]\n3',
        output: '[1,2,2,3,5,6]',
      },
      {
        input: '[1]\n1\n[]\n0',
        output: '[1]',
      },
    ],
    timeLimit: 800,
    memoryLimit: 96,
  },
  {
    id: '5',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    description: `
Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.
    `,
    constraints: [
      '1 <= s.length <= 10^4',
      "s consists of parentheses only '()[]{}'.",
    ],
    examples: [
      {
        input: 's = "()"',
        output: 'true',
        explanation: 'The parentheses match.',
      },
      {
        input: 's = "()[]{}"',
        output: 'true',
        explanation: 'All the parentheses match and are closed in the correct order.',
      },
      {
        input: 's = "(]"',
        output: 'false',
        explanation: "The parentheses don't match.",
      },
    ],
    testCases: [
      {
        input: '()',
        output: 'true',
      },
      {
        input: '()[]{}',
        output: 'true',
      },
      {
        input: '(]',
        output: 'false',
      },
    ],
    timeLimit: 500,
    memoryLimit: 64,
  },
  {
    id: '6',
    title: 'Longest Palindromic Substring',
    difficulty: 'Medium',
    description: `
Given a string \`s\`, return the longest palindromic substring in \`s\`.

A palindrome is a string that reads the same backward as forward.
    `,
    constraints: [
      '1 <= s.length <= 1000',
      's consist of only digits and English letters.',
    ],
    examples: [
      {
        input: 's = "babad"',
        output: '"bab"',
        explanation: '"aba" is also a valid answer.',
      },
      {
        input: 's = "cbbd"',
        output: '"bb"',
        explanation: 'The palindromic substring is "bb".',
      },
    ],
    testCases: [
      {
        input: 'babad',
        output: 'bab',
      },
      {
        input: 'cbbd',
        output: 'bb',
      },
    ],
    timeLimit: 1500,
    memoryLimit: 256,
  },
];

// Helper functions for storing and retrieving user problems status
export const getUserProblemStatus = (): UserProblemStatus[] => {
  const stored = localStorage.getItem('userProblemStatus');
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

export const saveUserProblemStatus = (status: UserProblemStatus[]): void => {
  localStorage.setItem('userProblemStatus', JSON.stringify(status));
};

export const getProblemStatus = (problemId: string): UserProblemStatus | undefined => {
  const statuses = getUserProblemStatus();
  return statuses.find(status => status.problemId === problemId);
};

export const updateProblemStatus = (problemId: string, solved: boolean): void => {
  const statuses = getUserProblemStatus();
  const existingStatus = statuses.find(status => status.problemId === problemId);
  
  if (existingStatus) {
    existingStatus.attempts += 1;
    existingStatus.solved = solved;
    existingStatus.lastAttemptDate = new Date();
  } else {
    statuses.push({
      problemId,
      solved,
      attempts: 1,
      lastAttemptDate: new Date(),
    });
  }
  
  saveUserProblemStatus(statuses);
};
