import { Logger } from '@nestjs/common';

// Keep test output readable; failures still surface through assertions.
Logger.overrideLogger(false);
