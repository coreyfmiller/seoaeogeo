import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'debug-analysis.log');

export function debugLog(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}\n`;
  
  try {
    fs.appendFileSync(logFile, logEntry);
  } catch (error) {
    console.error('Failed to write debug log:', error);
  }
}

export function clearDebugLog() {
  try {
    if (fs.existsSync(logFile)) {
      fs.unlinkSync(logFile);
    }
  } catch (error) {
    console.error('Failed to clear debug log:', error);
  }
}
