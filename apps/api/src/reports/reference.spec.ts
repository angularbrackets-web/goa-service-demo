import { generateReference, REFERENCE_PATTERN } from './reference.js';

describe('generateReference', () => {
  it('produces RD-XXXX-XXXX using only unambiguous characters', () => {
    for (let i = 0; i < 500; i++) {
      expect(generateReference()).toMatch(REFERENCE_PATTERN);
    }
  });

  it('is deterministic for a given random source', () => {
    expect(generateReference(() => 0)).toBe('RD-0000-0000');
    expect(generateReference(() => 31)).toBe('RD-ZZZZ-ZZZZ');
  });
});
