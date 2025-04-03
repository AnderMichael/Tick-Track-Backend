import { configDotenv } from "dotenv";

configDotenv();

export const configVariables = {
    port: process.env.PORT || 3000,
    dbHost: process.env.DB_HOST || 'localhost',
    dbPort: process.env.DB_PORT || 5432,
    dbUsername: process.env.DB_USERNAME || 'user',
    dbPassword: process.env.DB_PASSWORD || 'password',
    dbDatabase: process.env.DB_DATABASE || 'database',
    jwtSecret: process.env.JWT_SECRET || 'secretKey',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
}