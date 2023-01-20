export interface Interface {
  address: string;
  listenPort?: number;
  privateKey: string;
  dns: string[];
}

export interface Peer {
  publicKey: string;
  allowedIPs: string[];
  endpoint: string;
  persistentKeepalive?: number;
}

export interface WgConfig {
  name: string;
  interface: Interface;
  peer: Peer;
}
