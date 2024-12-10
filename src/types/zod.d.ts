import { z } from 'zod';

declare module 'zod' {
  interface ZodError {
    flatten(): {
      fieldErrors: Record<string, string[] | undefined>;
    };
  }
}
