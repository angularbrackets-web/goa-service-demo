import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';
import { AppConfig } from '../config.js';

/**
 * Minimal stand-in for staff authentication: a shared bearer token compared in
 * constant time. In a real GoA service this would be replaced by OIDC via
 * Keycloak (e.g. ADSP's access service) with role-based authorisation.
 */
@Injectable()
export class StaffTokenGuard implements CanActivate {
  private readonly expected: Buffer;

  constructor(config: AppConfig) {
    this.expected = digest(config.staffApiToken);
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const [scheme, token] = (request.headers.authorization ?? '').split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Missing bearer token');
    }
    // Hash both sides so the comparison is constant-time regardless of length.
    if (!timingSafeEqual(digest(token), this.expected)) {
      throw new UnauthorizedException('Invalid token');
    }
    return true;
  }
}

function digest(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}
