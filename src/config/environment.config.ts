import { configDotenv } from "dotenv"

configDotenv();

export const configVariables = {
    port: process.env.PORT || 3000,
    version: process.env.VERSION || '0',
}