// src/config/env.config.ts
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

export const env = {
  NODE_ENV: process.env.NODE_ENV,
  DB_PASSWORD: process.env.DB_PASSWORD,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  EXPIRE_JWT_AUTH: process.env.EXPIRE_JWT_AUTH,
  MAIL_USER: process.env.MAIL_USER,
  MAIL_PASS: process.env.MAIL_PASS,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
  GOOGLE_FAILED_CALLBACK_URL: process.env.GOOGLE_FAILED_CALLBACK_URL,
  FRONTEND_URL: process.env.FRONTEND_URL,
};
