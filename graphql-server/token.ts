import { createHmac } from 'crypto';
import { TokenData } from './defs';

const hashAlgorithm = 'sha256';

export async function createToken(data: TokenData): Promise<string> {
  const hmac = createHmac(hashAlgorithm, data.secret);
  hmac.update(data.host);
  hmac.update(data.secret);
  hmac.update(data.password);
  return hmac.digest('base64');
}
