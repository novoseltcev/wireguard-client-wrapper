import f from 'fs'
const fs = f.promises
import path from 'path'

import { getStrategy, generateConfigString } from "./utils";
import { WgStrategy } from "./strategies";
import { WgConfig } from "wgConfig";

class Wireguard {
    strategy: WgStrategy;

    constructor(processName: string) {
        this.strategy = getStrategy(processName);
    }

    
  async toggle(filePath: string): Promise<boolean> {
    const tunnelName = this.getNameFromPath(filePath);
    const activeTunnelName = await this.strategy.getActiveDevice();
  
    if (activeTunnelName && activeTunnelName !== tunnelName) {
      throw new Error("Another tunnel is already running, deactivate it first.");
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
    const filename = filePath.replace(/^.*[\\/]/, "");
    return filename.substring(0, filename.lastIndexOf("."))
  }

  async save(config: WgConfig | string, filePath: string): Promise<void> {
    try {
      const dir = path.dirname(filePath)
      await this.makeSureDirExists(dir)
      const configString = typeof config === 'string' ? config : generateConfigString(config)
      await fs.writeFile(filePath, configString)
      await fs.chmod(filePath, '600')
    } catch (e) {
      const message = `Failed to write config at path: ${filePath}`
      throw new Error(`${message}\n${e}`)
    }
  }

  private async makeSureDirExists(dir: string): Promise<void> {
    try {
      await fs.access(dir)
    } catch (e) {
      await fs.mkdir(dir, { recursive: true })
    }
  }
}