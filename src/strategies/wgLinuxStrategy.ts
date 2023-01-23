import { ExecError } from '../utils';

import { WgStrategy } from './wgStrategy';

export class WgLinuxStrategy extends WgStrategy {
  async isInstalled(): Promise<boolean> {
    const wgCommand = 'wg --version';
    const wgQuickCommand = 'wg-quick --version';
    const { stderr } = await this.exec(wgCommand, false);
    if (stderr) {
      return false;
    }

    try {
      await this.exec(wgQuickCommand, false);
      return false;
    } catch (error) {
      if (error instanceof ExecError) {
        return String(error.stderr).includes('command not found') ? false : true;
      }
      throw error;
    }
  }

  async getActiveDevice(): Promise<string> {
    try {
      const {stderr, stdout} = await this.exec("wg show", false);
      if (stderr) {
        throw new Error(stderr);
      }
    
      const lines = stdout!.split(/\n/);
      const tunnelName = lines[0].split(" ")[1]?.replace(/(\r\n|\n|\r)/gm, "");
    
      return tunnelName;
    } catch (e) {
      if (e instanceof ExecError) {
        if (!e.stderr) {
          throw new Error(e.stderr);
        }

        const splittedText: string[] = String(e.stderr).split(":");

        if (splittedText.length == 0) {
          return "";
        }

        const indexOfName = splittedText[0].lastIndexOf(" ");
        return splittedText[0].substring(indexOfName + 1, splittedText[0].length);
      }
      throw e;
    }
  }

  async up(filePath: string): Promise<void> {
    await this.exec(`wg-quick up ${filePath.replace(" ", "\\ ")}`);
  }

  async down(filePath: string): Promise<void> { 
    await this.exec(`wg-quick down ${filePath.replace(" ", "\\ ")}`);
  }

  async status(device: string): Promise<boolean> {
    const command = `wg show ${device}`;
    const { stderr, stdout } = await this.exec(command);
    if (stderr) {
      throw new Error(String(stderr));
    }
    return stdout!.match(/interface: (.*)/) ? true : false;
  }

  async generatePrivateKey(): Promise<string> {
    const {stdout, stderr} = await this.exec('wg genkey', false);
    if (stderr) {
      throw new Error(stderr);
    }
    return stdout!.trim();
  }

  async getPublicKey(privateKey: string): Promise<string> {
    const command = `echo "${privateKey}" | wg pubkey`;
    const { stdout, stderr } = await this.exec(command, false);
    if (stderr) {
      throw new Error(stderr);
    }
    return stdout!.trim();
  }
}
