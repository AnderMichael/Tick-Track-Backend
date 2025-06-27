import * as jwt from 'jsonwebtoken';
import { configVariables } from '../../../config/environment.config';
import { UserInfo } from '../models/UserInfo';

const { expiresIn, secret } = configVariables.jwt;

const { expiresIn: expiresInRefreshToken, secret: secretRefreshToken } =
  configVariables.jwt_refresh_token;

export class JWTUtils {
  /**
   * Generates a JWT token for a user.
   * @param payload - The payload to include in the token (e.g., user ID, roles).
   * @returns The generated JWT token.
   */
  public generateToken(payload: UserInfo): string {
    return jwt.sign(payload, secret, {
      expiresIn: parseInt(expiresIn, 10),
      encoding: 'utf8',
    });
  }

  public generateRefreshToken(payload: UserInfo) {
    return [
      jwt.sign(payload, secretRefreshToken, {
        expiresIn: parseInt(expiresInRefreshToken, 10),
        encoding: 'utf8',
      }) as string,
      parseInt(expiresInRefreshToken, 10) as number,
    ];
  }
  /**
   * Verifies a JWT token and returns the decoded payload.
   * @param token - The JWT token to verify.
   * @returns The decoded payload if the token is valid.
   * @throws An error if the token is invalid or expired.
   */
  public verifyToken(token: string): object | string {
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Invalidates a token (logout functionality).
   * Note: JWTs are stateless, so to "logout" you would typically handle this
   * by maintaining a token blacklist or changing the secret key.
   * @param token - The token to invalidate (optional for reference).
   */
  public invalidateToken(token: string): void {
    // Implement token blacklist logic here if needed.
    console.log(`Token invalidated: ${token}`);
  }
}
