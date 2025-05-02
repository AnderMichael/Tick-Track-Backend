import * as bcrypt from 'bcrypt';
import { configVariables } from '../../../config/environment.config';

const { user } = configVariables;

export class BcryptUtils {
  async getDefaultPassword(): Promise<string> {
    const defaultHashedPassword = await this.hashPassword(user.defaultPassword);
    return defaultHashedPassword;
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(user.hashSaltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  }
}
