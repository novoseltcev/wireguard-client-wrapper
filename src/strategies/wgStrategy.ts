import { WgConfig } from 'wgConfig';

export abstract class WgStrategy {
  abstract isInstalled(): Promise<boolean>;

  abstract save(config: WgConfig, dir: string): Promise<void>;
  abstract up(device: string, dir: string): Promise<void>;
  abstract down(device: string): Promise<void>;
  abstract status(device: string): Promise<boolean>;

  restart(device: string, dir: string): Promise<void> {
    return new Promise((resolve, _) => {
      this.down(device)
        .finally(() => this.up(device, dir))
        .then(() => resolve());
    });
  }

  abstract getPublicKey(config: string): Promise<string>;
}
