import { Injectable } from '@nestjs/common';
import { randomInt } from 'node:crypto';

// Crockford-style alphabet: no I, L, O or U, so references are easy to read
// out over the phone and hard to mistype.
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/** Generates a human-friendly reference such as `RD-7K3M-9QX2`. */
export function generateReference(
  random: (max: number) => number = randomInt,
): string {
  const chars = Array.from(
    { length: 8 },
    () => ALPHABET[random(ALPHABET.length)],
  );
  return `RD-${chars.slice(0, 4).join('')}-${chars.slice(4).join('')}`;
}

export const REFERENCE_PATTERN =
  /^RD-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/;

/** Injectable wrapper so tests can force collisions deterministically. */
@Injectable()
export class ReferenceGenerator {
  next(): string {
    return generateReference();
  }
}
