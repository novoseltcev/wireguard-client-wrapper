import { ExecError } from '../utils';
import { WgStrategy } from './wgStrategy';

export class WgWindowsStrategy extends WgStrategy {
  async isInstalled(): Promise<boolean> {
    try {
      await this.exec('"C:\\Program Files\\Wireguard\\wg.exe" --version', false);
    } catch (error) {
      if (error instanceof ExecError) {
        return false;
      }
      throw error;
    }

    try {
      await this.exec('"C:\\Program Files\\Wireguard\\wireguard.exe" --version', false);
      return false;
    } catch (error) {
      if (error instanceof ExecError) {
        if (
          String(error.stderr).includes('не является внутренней или внешней')
        ) {
          return false;
        }
        if (String(error.stderr).includes('is not recognized as an internal')) {
          return false;
        }
        return true;
      }
      throw error;
    }
  }

  async getActiveDevice(): Promise<string | null> {
    try {
      const { stderr, stdout } = await this.exec('wg show', false);
      if (stderr) {
        throw new Error(stderr);
      }

      const lines = stdout!.split(/\n/);
      return lines[0].split(' ')[1]?.replace(/(\r\n|\n|\r)/gm, '') || null;
    } catch (error) {
      if (error instanceof ExecError && error.stderr) {
        const splittedText: string[] = String(error.stderr).split(':');

        if (splittedText.length === 0) {
          return '';
        }
        return splittedText[0].split(' ').slice(-1)[0];
      }
      throw error;
    }
  }

  async up(filePath: string): Promise<void> {
    await this.exec(`wireguard /installtunnelservice "${filePath}"`);
  }

  async down(filePath: string): Promise<void> {
    await this.exec(
      `wireguard /uninstalltunnelservice ${this.getNameFromPath(filePath)}`,
    );
  }

  getNameFromPath(filePath: string): string {
    const filename = filePath.replace(/^.*[\\/]/, '');
    return filename.slice(0, Math.max(0, filename.lastIndexOf('.')));
  }

  async status(device: string): Promise<boolean> {
    try {
      const { stderr, stdout } = await this.exec(`wg show ${device}`);
      if (stderr) {
        throw new Error(String(stderr));
      }
      return Boolean(stdout!.match(/interface: (.*)/));
    } catch (error) {
      if (
        error instanceof ExecError &&
        String(error.error).includes('No such file or directory')
      ) {
        return false;
      }
      throw error;
    }
  }

  async generatePrivateKey(): Promise<string> {
    const { stdout, stderr } = await this.exec('wg genkey', false);
    if (stderr) {
      throw new Error(stderr);
    }
    return stdout!.trim();
  }

  async getPublicKey(privateKey: string): Promise<string> {
    const command = `echo ${privateKey} | wg pubkey`;
    const { stdout, stderr } = await this.exec(command, false);
    if (stderr) {
      throw new Error(stderr);
    }
    return stdout!.trim();
  }
}
