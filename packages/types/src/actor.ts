export interface Actor {
  "@context": string[];
  id: string;
  type: string;
  preferredUsername: string;
  inbox: string;
  publicKey: PublicKey;
}

export interface PublicKey {
  id: string;
  owner: string;
  publicKeyPem: string;
}
