import * as jwt from 'jsonwebtoken';
import { configVariables } from '../../../config/environment.config';
import { AccountKeyPayload } from '../models/account.key.payload';

const { expiresIn, secret } = configVariables.jwt_account_key;

export class JWTUtils {
  generateAccountKeyToken(payload: AccountKeyPayload): string {
    return jwt.sign(payload, secret, {
      expiresIn: parseInt(expiresIn, 10),
      encoding: 'utf8',
    });
  }

  async verifyAccountKeyToken(token: string): Promise<{ upbCode: number }> {
    try {
      const { accountKey } = jwt.verify(token, secret) as AccountKeyPayload;
      const [_, upbCode] = accountKey.split('-');
      return {
        upbCode: parseInt(upbCode),
      };
    } catch (error) {
      throw new Error('Invalid or expired account key token');
    }
  }
}
