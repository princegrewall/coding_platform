const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const runCpp = (code, input) => {
  return new Promise((resolve, reject) => {
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
    const compileCmd = `g++ "${filePath}" -o "${exePath}"`;
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
      child.stdout.on("data", (data) => {
        output += data.toString();
      });
      child.stderr.on("data", (data) => {
        console.error("Runtime error:", data.toString());
      });
      child.on("close", (code) => {
        cleanup();
        if (code === 0) {
          resolve(output.trim());
        } else {
          reject({ verdict: "Runtime Error", error: `Process exited with code ${code}` });
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
