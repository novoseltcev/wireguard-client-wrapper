import { run } from '../utils';
import { WgConfig } from 'wgConfig';

type WgResponse = {
  stdout?: string;
  stderr?: string;
}

export abstract class WgStrategy {
  private processName: string

  constructor(processName: string) {
    this.processName = processName;
  }

  protected async exec(command: string, sudoPrompt = true): Promise<WgResponse> {
    const result = await run(command, this.processName, sudoPrompt);
    if (result.stderr && Buffer.isBuffer(result.stderr)) {
      result.stderr = result.stderr.toString('utf-8');
    }
    if (result.stdout && Buffer.isBuffer(result.stdout)) {
      result.stdout = result.stdout.toString('utf-8');
    }
    return {
      stdout: result.stdout,
      stderr: result.stderr,
    };
  }

  abstract isInstalled(): Promise<boolean>;

  abstract getActiveDevice(): Promise<string>;
  abstract up(filePath: string): Promise<void>;
  abstract down(filePath: string): Promise<void>;
  abstract status(device: string): Promise<boolean>;

  abstract getPublicKey(config: string): Promise<string>;
}
