import { spawn } from "child_process";
import path from "path";

export function runPythonScript(scriptName: string, args: string[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(process.cwd(), "server", scriptName);
    const pythonProcess = spawn("python", [scriptPath, ...args]);
    
    let dataString = "";
    let errorString = "";
    
    pythonProcess.stdout.on("data", (data) => {
      dataString += data.toString();
    });
    
    pythonProcess.stderr.on("data", (data) => {
      errorString += data.toString();
    });
    
    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.error(`Python script error (${scriptName}):`, errorString);
        reject(new Error(`Python script (${scriptName}) exited with code ${code}: ${errorString}`));
      } else {
        try {
          // Try to parse as JSON, but fall back to the raw string if that fails
          const result = JSON.parse(dataString);
          resolve(result);
        } catch (e) {
          resolve(dataString.trim());
        }
      }
    });
    
    // Handle errors spawning the process
    pythonProcess.on("error", (err) => {
      console.error(`Failed to start Python process (${scriptName}):`, err);
      reject(err);
    });
  });
}
