import os from 'os';
import {
  WgLinuxStrategy,
  WgMacStrategy,
  WgStrategy,
  WgWindowsStrategy,
} from '../strategies';

export function getStrategy(processName: string): WgStrategy {
  switch (os.platform()) {
    case 'linux':
      return new WgLinuxStrategy(processName);
    case 'win32':
      return new WgWindowsStrategy(processName);
    case 'darwin':
      return new WgMacStrategy(processName);
    default:
      throw new Error('Unsupported OS');
  }
}
