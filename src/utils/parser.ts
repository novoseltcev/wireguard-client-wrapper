import { WgConfig } from "../wgConfig";

export const generateConfigString = (config: WgConfig) => {
    const result: string[] = []
    const { wgInterface, wgPeer } = config 
    const { 
        address, 
        privateKey, 
        listenPort, 
        dns,
    } = wgInterface

    result.push('[Interface]')
    if (address !== undefined && address.length) result.push(`Address = ${address.join(',')}`)
    if (privateKey) result.push(`PrivateKey = ${privateKey}`)
    if (listenPort) result.push(`ListenPort = ${listenPort}`)
    if (dns && dns.length) result.push(`DNS = ${dns.join(',')}`)
    
    const { 
        publicKey, 
        allowedIPs, 
        endpoint, 
        persistentKeepalive,
    } = wgPeer

    result.push('')
    result.push('[Peer]')
    if (publicKey) result.push(`PublicKey = ${publicKey}`)
    if (allowedIPs && allowedIPs.length) result.push(`AllowedIPs = ${allowedIPs.join(',')}`)
    if (endpoint) result.push(`Endpoint = ${endpoint}`)
    if (persistentKeepalive) result.push(`PersistentKeepalive = ${persistentKeepalive}`)

    return result.join('\n')
  }