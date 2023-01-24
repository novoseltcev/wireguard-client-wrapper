import f from 'fs';
const fs = f.promises;

import { suite, test } from '@testdeck/mocha';
import * as chai from 'chai';
import { expect } from 'chai';
import { WgLinuxStrategy, WgStrategy } from '../src/strategies';
import { getStrategy } from '../src/utils';

chai.should();
const _ = chai.expect;

@suite
class StrategyTest {
  private platform: string;
  private device: string;
  private strategy: WgStrategy;

  public before() {
    this.platform = process.platform;
    this.device = 'wg-test';
    const processName = 'test wg client';

    switch (this.platform) {
      case 'linux':
        this.strategy = new WgLinuxStrategy(processName);
        break;

      // case 'darwin':
      //   this.strategy = new WgMacStrategy(processName);
      //   break;

      // case 'win32':
      //   this.strategy = new WgWindowsStrategy(processName);
      //   break;

      default:
        throw new Error('Unsupported platform');
    }
    this.strategy = getStrategy('test wg client');
  }

  @test
  async 'Dependencies is installed'() {
    expect(await this.strategy.isInstalled()).to.be.true;
  }

  @test
  async 'Check status'() {
    expect(await this.strategy.status(this.device)).to.be.false;
  }

  @test
  async 'Generate private key'() {
    const key = await this.strategy.generatePrivateKey();
    expect(key).to.be.a('string');
    expect(key).to.have.lengthOf(44);
    expect(key[43]).to.be.equal('='); // base64
  }

  @test
  async 'Get public key'() {
    const key = await this.strategy.getPublicKey(
      await this.strategy.generatePrivateKey(),
    );
    expect(key).to.be.a('string');
    expect(key).to.have.lengthOf(44);
    expect(key[43]).to.be.equal('='); // base64
  }

  @test
  async 'Get active device'() {
    const device = await this.strategy.getActiveDevice();
    expect(device).to.be.a('null');
  }

  @test
  async 'Up and down'() {
    const tmpDir = this.platform == 'win32' ? 'C:\\Windows\\Temp\\' : '/tmp/';
    const filePath = tmpDir + `${this.device}.conf`;
    await fs.writeFile(filePath, '');
    await this.strategy.up(filePath);
    expect(await this.strategy.status(this.device)).to.be.true;
    await this.strategy.down(filePath);
    expect(await this.strategy.status(this.device)).to.be.false;
  }
}
