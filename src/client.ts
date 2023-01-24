import f from 'fs';
import path from 'path';
import { WgConfig } from 'wgConfig';
import { WgStrategy } from './strategies';
import { generateConfigString, getStrategy } from './utils';

const fs = f.promises;

export class Wireguard {
  strategy: WgStrategy;

  constructor(processName: string) {
    this.strategy = getStrategy(processName);
  }

  async toggle(filePath: string): Promise<boolean> {
    const tunnelName = this.getNameFromPath(filePath);
    const activeTunnelName = await this.strategy.getActiveDevice();

    if (activeTunnelName && activeTunnelName !== tunnelName) {
      throw new Error(
        'Another tunnel is already running, deactivate it first.',
      );
    }

    let started = false;

    if (activeTunnelName === tunnelName) {
      await this.strategy.down(filePath);
      started = false;
    } else {
      await this.strategy.up(filePath);
      started = true;
    }

    return started;
  }

  private getNameFromPath(filePath: string): string {
    const filename = filePath.replace(/^.*[\\/]/, '');
    return filename.slice(0, Math.max(0, filename.lastIndexOf('.')));
  }

  async save(config: WgConfig | string, filePath: string): Promise<void> {
    try {
      const dir = path.dirname(filePath);
      await this.makeSureDirExists(dir);
      const configString =
        typeof config === 'string' ? config : generateConfigString(config);
      await fs.writeFile(filePath, configString);
      await fs.chmod(filePath, '600');
    } catch (error) {
      const message = `Failed to write config at path: ${filePath}`;
      throw new Error(`${message}\n${error}`);
    }
  }

  private async makeSureDirExists(dir: string): Promise<void> {
    try {
      await fs.access(dir);
    } catch (error) {
      await fs.mkdir(dir, { recursive: true });
    }
  }
}
