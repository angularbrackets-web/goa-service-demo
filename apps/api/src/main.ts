import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';
import { AppConfig } from './config.js';

try {
  process.loadEnvFile(); // optional apps/api/.env for local development
} catch {
  // no .env file - use the real environment
}

const app = await NestFactory.create(AppModule);
configureApp(app);
app.enableShutdownHooks();
await app.listen(app.get(AppConfig).port);
