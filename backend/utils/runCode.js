const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

// Configuration
const MAX_EXECUTION_TIME = 5000; // 5 seconds timeout

// Helper function to create a unique filename
const getUniqueFilename = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `temp_${timestamp}_${random}`;
};

// Helper function to check if C++ code handles input properly
const checkCppInputHandling = (code) => {
  console.log('\n=== Starting Code Validation ===');
  console.log('Raw code:', code);
  
  const normalizedCode = code.toLowerCase();
  console.log('\nNormalized code:', normalizedCode);
  
  // Check for basic input handling
  const hasBasicInput = /cin\s*>>|getline\s*\(|scanf\s*\(/.test(normalizedCode);
  console.log('\nInput handling check:');
  console.log('- Has basic input:', hasBasicInput);
  console.log('- Input patterns found:', normalizedCode.match(/cin\s*>>|getline\s*\(|scanf\s*\(/g));
  
  // Check for proper input stream setup
  const hasProperSetup = /#include\s*<iostream>|#include\s*<cstdio>/.test(normalizedCode);
  console.log('\nSetup check:');
  console.log('- Has proper setup:', hasProperSetup);
  console.log('- Headers found:', normalizedCode.match(/#include\s*<[^>]+>/g));
  
  // Check for proper main function
  const hasMainFunction = /int\s+main\s*\(/.test(normalizedCode);
  console.log('\nMain function check:');
  console.log('- Has main function:', hasMainFunction);
  console.log('- Main function found:', normalizedCode.match(/int\s+main\s*\([^)]*\)/g));

  // Improved variable declaration detection - now handles multiple variables and spaces
  const variablePattern = /(int|string|char|double|float|long)\s+[\w\s,]+;/g;
  const variableMatches = normalizedCode.match(variablePattern) || [];
  const hasVariableDeclarations = variableMatches.length > 0;
  
  console.log('\nVariable declaration check:');
  console.log('- Variable pattern:', variablePattern);
  console.log('- Variables found:', variableMatches);
  console.log('- Has variable declarations:', hasVariableDeclarations);

  // Log the entire validation process
  console.log('\nValidation steps:');
  console.log('1. Headers check:', hasProperSetup ? 'PASS' : 'FAIL');
  console.log('2. Main function check:', hasMainFunction ? 'PASS' : 'FAIL');
  console.log('3. Input handling check:', hasBasicInput ? 'PASS' : 'FAIL');
  console.log('4. Variable declaration check:', hasVariableDeclarations ? 'PASS' : 'FAIL');

  // Basic validation
  if (!hasProperSetup) {
    console.log('\nValidation failed: Missing proper setup');
    return { 
      valid: false, 
      error: "Missing required header. Please include <iostream> or <cstdio> for input handling." 
    };
  }

  if (!hasMainFunction) {
    console.log('\nValidation failed: Missing main function');
    return { 
      valid: false, 
      error: "Missing main function. Your code must have an int main() function." 
    };
  }

  // If there's no input handling, we don't need to check for variables
  if (!hasBasicInput) {
    console.log('\nValidation failed: No input handling found');
    return { 
      valid: false, 
      error: "No input handling found. Please use cin, getline, or scanf to read input." 
    };
  }

  // If we have input handling but no variables, that's an error
  if (hasBasicInput && !hasVariableDeclarations) {
    console.log('\nValidation failed: No variables declared for input');
    console.log('Input handling found but no variables declared');
    return { 
      valid: false, 
      error: "No variables declared for input. Please declare variables to store input values." 
    };
  }

  console.log('\nValidation passed successfully');
  return { valid: true };
};

// Execute code with timeout
const executeWithTimeout = (spawnProcess, timeout) => {
  return new Promise((resolve, reject) => {
    let output = '';
    let errorOutput = '';
    let killed = false;

    // Set timeout
    const timeoutId = setTimeout(() => {
      spawnProcess.kill();
      killed = true;
      reject({ verdict: 'Time Limit Exceeded', error: `Execution exceeded ${timeout}ms` });
    }, timeout);

    spawnProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    spawnProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    spawnProcess.on('close', (code) => {
      clearTimeout(timeoutId);
      
      if (!killed) {
        if (code === 0) {
          resolve(output);
        } else {
          reject({ verdict: 'Runtime Error', error: errorOutput || `Process exited with code ${code}` });
        }
      }
    });
  });
};

// Main function to run C++ code
const runCode = async (code, input) => {
  try {
    console.log('\n=== Starting Code Execution ===');
    console.log('Input provided:', input);
    console.log('Code to run:', code);

    // Check if input is required but not handled in code
    if (input && input.trim() !== '') {
      console.log('\nInput provided, checking input handling...');
      const inputCheck = checkCppInputHandling(code);
      console.log('Input check result:', inputCheck);
      
      if (!inputCheck.valid) {
        throw { 
          verdict: 'Compilation Error', 
          error: inputCheck.error
        };
      }
    }

    const uniqueName = getUniqueFilename();
    const filePath = path.join(__dirname, `${uniqueName}.cpp`);
    const exePath = path.join(__dirname, `${uniqueName}.exe`);
    
    try {
      // Write code to file
      await writeFileAsync(filePath, code);
      
      // Compile code with detailed error reporting
      const compileResult = await new Promise((resolve, reject) => {
        // Add -Wall for all warnings and -Werror to treat warnings as errors
        const compileCmd = `g++ "${filePath}" -o "${exePath}" -std=c++17 -Wall -Werror`;
        
        exec(compileCmd, (error, stdout, stderr) => {
          if (error || stderr) {
            // Clean up the error message to be more user-friendly
            const errorMessage = stderr
              .replace(filePath, 'your code')
              .replace(/:\d+:\d+:/g, ': ') // Remove line and column numbers
              .replace(/error:/gi, 'Error: ')
              .replace(/warning:/gi, 'Warning: ')
              .trim();
            
            reject({ 
              verdict: 'Compilation Error', 
              error: errorMessage || error.message 
            });
          } else {
            resolve(stdout);
          }
        });
      });
      
      // Run the executable
      const child = spawn(`"${exePath}"`, { shell: true });
      
      // Write input to stdin if provided
      if (input) {
        child.stdin.write(input);
        child.stdin.end();
      }
      
      // Execute with timeout
      const result = await executeWithTimeout(child, MAX_EXECUTION_TIME);
      return result.trim();
    } finally {
      // Cleanup
      try {
        if (fs.existsSync(filePath)) await unlinkAsync(filePath);
        if (fs.existsSync(exePath)) await unlinkAsync(exePath);
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    }
  } catch (error) {
    console.error('\nError in runCode:', error);
    throw error;
  }
};

module.exports = runCode; 