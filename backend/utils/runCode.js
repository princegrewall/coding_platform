const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

// Configuration
const MAX_EXECUTION_TIME = 5000; // 5 seconds timeout
const MAX_MEMORY = 512 * 1024 * 1024; // 512MB memory limit

// Helper function to create a unique filename
const getUniqueFilename = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `temp_${timestamp}_${random}`;
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

// Run C++ code
const runCpp = async (code, input, timeout = MAX_EXECUTION_TIME) => {
  const uniqueName = getUniqueFilename();
  const filePath = path.join(__dirname, `${uniqueName}.cpp`);
  const exePath = path.join(__dirname, `${uniqueName}.exe`);
  
  try {
    // Write code to file
    await writeFileAsync(filePath, code);
    
    // Compile code
    const compileResult = await new Promise((resolve, reject) => {
      exec(`g++ "${filePath}" -o "${exePath}" -std=c++17`, (error, stdout, stderr) => {
        if (error || stderr) {
          reject({ verdict: 'Compilation Error', error: stderr || error.message });
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
    const result = await executeWithTimeout(child, timeout);
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
};

// Run Python code
const runPython = async (code, input, timeout = MAX_EXECUTION_TIME) => {
  const uniqueName = getUniqueFilename();
  const filePath = path.join(__dirname, `${uniqueName}.py`);
  
  try {
    // Write code to file
    await writeFileAsync(filePath, code);
    
    // Run Python script
    const child = spawn('python', [filePath]);
    
    // Write input to stdin if provided
    if (input) {
      child.stdin.write(input);
      child.stdin.end();
    }
    
    // Execute with timeout
    const result = await executeWithTimeout(child, timeout);
    return result.trim();
  } finally {
    // Cleanup
    try {
      if (fs.existsSync(filePath)) await unlinkAsync(filePath);
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
};

// Run Java code
const runJava = async (code, input, timeout = MAX_EXECUTION_TIME) => {
  // Extract the class name (must be public class)
  const classNameRegex = /public\s+class\s+([a-zA-Z_$][a-zA-Z\d_$]*)/;
  const match = code.match(classNameRegex);
  
  if (!match) {
    throw { verdict: 'Compilation Error', error: 'No public class found in Java code' };
  }
  
  const className = match[1];
  const uniqueName = getUniqueFilename();
  const dirPath = path.join(__dirname, uniqueName);
  const filePath = path.join(dirPath, `${className}.java`);
  
  try {
    // Create directory
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
    
    // Write code to file
    await writeFileAsync(filePath, code);
    
    // Compile Java code
    const compileResult = await new Promise((resolve, reject) => {
      exec(`javac "${filePath}"`, { cwd: dirPath }, (error, stdout, stderr) => {
        if (error || stderr) {
          reject({ verdict: 'Compilation Error', error: stderr || error.message });
        } else {
          resolve(stdout);
        }
      });
    });
    
    // Run Java program
    const child = spawn('java', [className], { cwd: dirPath });
    
    // Write input to stdin if provided
    if (input) {
      child.stdin.write(input);
      child.stdin.end();
    }
    
    // Execute with timeout
    const result = await executeWithTimeout(child, timeout);
    return result.trim();
  } finally {
    // Cleanup
    try {
      // Delete the directory recursively
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
          fs.unlinkSync(path.join(dirPath, file));
        }
        fs.rmdirSync(dirPath);
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
};

// Main function to run code in any supported language
const runCode = async (code, input, language) => {
  // Normalize language name
  const normalizedLanguage = language.toLowerCase();
  
  try {
    if (normalizedLanguage === 'cpp' || normalizedLanguage === 'c++') {
      return await runCpp(code, input);
    } else if (normalizedLanguage === 'python' || normalizedLanguage === 'py') {
      return await runPython(code, input);
    } else if (normalizedLanguage === 'java') {
      return await runJava(code, input);
    } else {
      throw { verdict: 'Unsupported Language', error: `Language ${language} is not supported` };
    }
  } catch (error) {
    throw error; // Pass any errors up to the caller
  }
};

module.exports = runCode; 