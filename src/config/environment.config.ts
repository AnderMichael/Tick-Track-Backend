import { configDotenv } from 'dotenv';

configDotenv();

export const configVariables = {
  port: process.env.PORT || 3000,
  version: process.env.VERSION || '0',
  user: {
    defaultPassword: process.env.USER_DEFAULT_PASSWORD || 'DefaultPassword123',
    hashSaltRounds: Number(process.env.PASSWORD_HASH_SALT_ROUNDS) || 10,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '3600',
  },
  jwt_account_key: {
    secret: process.env.ACCOUNT_KEY_JWT_SECRET || 'default_account_key_secret',
    expiresIn: process.env.ACCOUNT_KEY_JWT_EXPIRES_IN || '3600',
  },
};
