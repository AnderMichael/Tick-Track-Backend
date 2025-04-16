import { configDotenv } from "dotenv"

configDotenv();

export const configVariables = {
    port: process.env.PORT || 3000,
    version: process.env.VERSION || '0',
    user: {
        defaultPassword: process.env.USER_DEFAULT_PASSWORD || 'DefaultPassword123',
        hashSaltRounds: Number(process.env.HASH_SALT_ROUNDS) || 10,
    }
}