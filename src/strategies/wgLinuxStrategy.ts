import WgConfig from "wgConfig";
import { exec } from "child_process";
import WgStrategy from "./wgStrategy";

export default class wgLinuxStrategy extends WgStrategy {
    isInstalled(): Promise<boolean> {
        const wgCommand = "wg --version";
        const wgQuickCommand = "wg-quick --version";
        return new Promise((resolve, reject) => {
            exec(wgCommand, (error, _, stderr) => {
                if (error) {
                    reject(error);
                }
                if (stderr) {
                    reject(stderr);
                }
                exec(wgQuickCommand, (error, _, stderr) => {
                    if (error) {
                        reject(error);
                    }
                    if (stderr) {
                        reject(stderr);
                    }
                    resolve(true);
                });
            });
        });
    }
    
    save(config: WgConfig, dir: string): Promise<void> {
        const file = `${dir}/${config.name}.conf`;
        const output = `
            [Interface]
            Address = ${config.interface.address}
            PrivateKey = ${config.interface.address}
            ListenPort = ${config.interface.listenPort}
            DNS = ${config.interface.dns}
            
            [Peer]\nPublicKey = ${config.peer.publicKey}
            AllowedIPs = ${config.peer.allowedIPs}
            Endpoint = ${config.peer.endpoint}
            PersistentKeepalive = ${config.peer.persistentKeepalive}
        `;
        const command = `echo "${output}" > ${file}`;
        return new Promise((resolve, reject) => {
            exec(command, (error, _, stderr) => {
                if (error) {
                    reject(error);
                }
                if (stderr) {
                    reject(stderr);
                }
                resolve();
            });
        });
    }

    up(device: string, dir: string): Promise<void> {
        const file = `${dir}/${device}.conf`;
        const command = `wg-quick up ${file}`;
        return new Promise((resolve, reject) => {
            exec(command, (error, _, stderr) => {
                if (error) {
                    reject(error);
                }
                if (stderr) {
                    reject(stderr);
                }
                resolve();
            });
        });
    }

    down(device: string): Promise<void> {
        const command = `wg-quick down ${device}`;
        return new Promise((resolve, reject) => {
            exec(command, (error, _, stderr) => {
                if (error) {
                    reject(error);
                }
                if (stderr) {
                    reject(stderr);
                }
                resolve();
            });
        });
    }

    status(device: string): Promise<boolean> {
        const command = `wg show ${device}`;
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                }
                if (stderr) {
                    reject(stderr);
                }
                resolve(stdout.length > 0);
            });
        });
    }

    getPublicKey(privateKey: string): Promise<string> {
        const command = `echo "${privateKey}" | wg pubkey`
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                }
                if (stderr) {
                    reject(stderr);
                }
                resolve(stdout);
            });
        });
    }
}