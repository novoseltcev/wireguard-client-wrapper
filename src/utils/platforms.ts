import os from 'os';
import {
  WgStrategy,
  WgLinuxStrategy,
  // WgWindowsStrategy,
  // WgMacStrategy,
} from '../strategies';

export function getStrategy(processName: string): WgStrategy {
  switch (os.platform()) {
    case 'linux':
      return new WgLinuxStrategy(processName);
    // case "win32":
    //     return new WgWindowsStrategy();
    // case "darwin":
    //     return new WgMacStrategy();
    default:
      throw new Error('Unsupported OS');
  }
}

