import { promises as fs } from 'fs';

export async function publicKey(): Promise<string> {
    const data = await fs.readFile('/var/lib/actor/pubkey.pem', 'binary');
    return Buffer.from(data).toString();
}
