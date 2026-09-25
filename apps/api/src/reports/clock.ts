import { Injectable } from '@nestjs/common';

/** Wraps "now" so business rules that depend on the date are easy to test. */
@Injectable()
export class Clock {
  now(): Date {
    return new Date();
  }

  /** Today's calendar date in Alberta (YYYY-MM-DD). */
  todayInAlberta(): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Edmonton',
    }).format(this.now());
  }
}
