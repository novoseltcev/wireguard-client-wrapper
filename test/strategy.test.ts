import { suite, test } from '@testdeck/mocha';
import * as chai from 'chai';
import { expect } from 'chai';
import { WgLinuxStrategy, WgStrategy } from '../src/strategies';
import { getStrategy } from '../src/utils';

chai.should();
const _ = chai.expect;

@suite
class LinuxStrategyTest {
  private platform: string;
  private strategy: WgStrategy;

  public before() {
    this.platform = process.platform;
    this.strategy = getStrategy('test wg client');
  }

  @test
  'Strategy valid for platforms'() {
    expect(this.platform).to.be.equal('linux');
    expect(this.strategy).to.be.instanceOf(WgLinuxStrategy);
  }

  @test
  async 'Dependencies is installed'() {
    expect(await this.strategy.isInstalled()).to.be.true;
  }

  @test
  async 'Check status'() {
    expect(await this.strategy.status('wg0')).to.be.false;
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
    const filePath = '/tmp/wg0.conf';
    await this.strategy.up(filePath);
    expect(await this.strategy.status('wg0')).to.be.true;
    await this.strategy.down(filePath);
    expect(await this.strategy.status('wg0')).to.be.false;
  }
}
