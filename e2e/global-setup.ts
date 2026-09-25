import { execFileSync } from 'node:child_process';
import { databaseUrl } from '../playwright.config';

/** Start every e2e run from an empty reports table (the table may not exist yet). */
export default function globalSetup() {
  execFileSync('npx', ['prisma', 'db', 'execute', '--stdin'], {
    cwd: 'apps/api',
    env: { ...process.env, DATABASE_URL: databaseUrl },
    input: `DO $$ BEGIN
      IF to_regclass('road_issue_reports') IS NOT NULL THEN TRUNCATE road_issue_reports; END IF;
    END $$;`,
    stdio: ['pipe', 'ignore', 'inherit'],
  });
}
