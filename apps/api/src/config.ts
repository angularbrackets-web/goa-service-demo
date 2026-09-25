import { Injectable } from '@nestjs/common';

/**
 * Typed, validated application configuration read once from the environment.
 * Failing fast at startup beats discovering a missing variable at runtime.
 */
@Injectable()
export class AppConfig {
  readonly port: number;
  readonly databaseUrl: string;
  readonly staffApiToken: string;

  constructor(env: NodeJS.ProcessEnv = process.env) {
    this.port = Number(env.PORT ?? 3000);
    this.databaseUrl = required(env, 'DATABASE_URL');
    this.staffApiToken = required(env, 'STAFF_API_TOKEN');
    if (this.staffApiToken.length < 16) {
      throw new Error('STAFF_API_TOKEN must be at least 16 characters');
    }
  }
}

function required(env: NodeJS.ProcessEnv, key: string): string {
  const value = env[key];
  if (!value) {
    throw new Error(`Missing required environment variable ${key}`);
  }
  return value;
}
