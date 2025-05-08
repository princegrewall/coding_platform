const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Helper function to check if C++ code handles input properly
const checkCppInputHandling = (code) => {
  const normalizedCode = code.toLowerCase();
  
  // Check for basic input handling
  const hasBasicInput = /cin\s*>>|getline\s*\(|scanf\s*\(/.test(normalizedCode);
  
  // Check for proper input stream setup
  const hasProperSetup = /#include\s*<iostream>|#include\s*<cstdio>/.test(normalizedCode);
  
  // Check for variable declarations for input
  const hasVariableDeclarations = /(int|string|char|double|float|long)\s+\w+\s*;/.test(normalizedCode);
  
  // Check for proper main function
  const hasMainFunction = /int\s+main\s*\(/.test(normalizedCode);

  // Check if code has hardcoded values instead of input
  const hasHardcodedValues = /=\s*\d+|=\s*"[^"]*"|=\s*'[^']*'/.test(normalizedCode);

  if (!hasProperSetup) {
    return { 
      valid: false, 
      error: "Missing required header. Please include <iostream> or <cstdio> for input handling." 
    };
  }

  if (!hasMainFunction) {
    return { 
      valid: false, 
      error: "Missing main function. Your code must have an int main() function." 
    };
  }

  if (!hasVariableDeclarations) {
    return { 
      valid: false, 
      error: "No variables declared for input. Please declare variables to store input values." 
    };
  }

  if (!hasBasicInput) {
    return { 
      valid: false, 
      error: "No input handling found. Please use cin, getline, or scanf to read input." 
    };
  }

  if (hasHardcodedValues && !hasBasicInput) {
    return {
      valid: false,
      error: "Hardcoded values detected. Please use input handling instead of hardcoded values."
    };
  }

  return { valid: true };
};

const runCpp = (code, input) => {
  return new Promise((resolve, reject) => {
    // Always check for input handling if input is provided
    if (input && input.trim() !== '') {
      const inputCheck = checkCppInputHandling(code);
      if (!inputCheck.valid) {
        return reject({ 
          verdict: "Compilation Error", 
          error: inputCheck.error
        });
      }
    }

    // Use fixed names for simplicity (you can modify for unique names if needed)
    const filePath = path.join(__dirname, 'temp.cpp');
    const exePath = path.join(__dirname, 'temp.exe');

    // Write the C++ code to file
    try {
      fs.writeFileSync(filePath, code);
    } catch (writeErr) {
      console.error("Error writing code file:", writeErr);
      return reject({ verdict: "Compilation Error", error: writeErr.message });
    }

    console.log("Compiling code from:", filePath);

    // Wrap file paths in quotes to handle spaces
    const compileCmd = `g++ "${filePath}" -o "${exePath}" -std=c++17`;
    exec(compileCmd, (compileError, stdout, stderr) => {
      if (compileError || stderr) {
        console.error("Compilation error:", stderr);
        cleanup();
        return reject({ verdict: "Compilation Error", error: stderr });
      }

      console.log("Compilation successful! Running executable...");

      // Use spawn to run the executable
      const child = spawn(`"${exePath}"`, { shell: true });

      let output = "";
      let errorOutput = "";
      
      child.stdout.on("data", (data) => {
        output += data.toString();
      });
      
      child.stderr.on("data", (data) => {
        errorOutput += data.toString();
        console.error("Runtime error:", data.toString());
      });
      
      child.on("close", (code) => {
        cleanup();
        if (code === 0) {
          // If input is required but no output is produced, reject
          if (input && !output.trim()) {
            reject({ 
              verdict: "Runtime Error", 
              error: "No output produced. Make sure your code is reading input correctly and producing output." 
            });
          } else {
            // If input is required, verify that the code actually used the input
            if (input && !errorOutput.includes("cin") && !errorOutput.includes("scanf")) {
              reject({
                verdict: "Runtime Error",
                error: "Code did not properly handle input. Please ensure you are reading input values."
              });
            } else {
              resolve(output.trim());
            }
          }
        } else {
          reject({ 
            verdict: "Runtime Error", 
            error: errorOutput || `Process exited with code ${code}. Make sure your input handling is correct.` 
          });
        }
      });

      // Write input (if provided) to the child process
      if (input) {
        child.stdin.write(input);
      }
      child.stdin.end();
    });

    const cleanup = () => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (fs.existsSync(exePath)) fs.unlinkSync(exePath);
    };
  });
};

module.exports = runCpp;
