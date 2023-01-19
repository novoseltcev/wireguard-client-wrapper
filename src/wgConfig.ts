interface Interface {
    address: string;
    listenPort?: number;
    privateKey: string;
    dns: string[];
}

interface Peer {
    publicKey: string;
    allowedIPs: string[];
    endpoint: string;
    persistentKeepalive?: number;
}

interface WgConfig {
    name: string;
    interface: Interface;
    peer: Peer;
}

export default WgConfig;
export type { Interface, Peer };
