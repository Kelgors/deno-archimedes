import { validator } from 'hono/validator';
import type { ZodSchema } from 'zod';

// fix: https://github.com/honojs/middleware/issues/77
export function zJsonValidator<T>(zodType: ZodSchema<T>) {
  return validator('json', (v) => {
    const result = zodType.safeParse(v);
    if (!result.success) {
      return new Response(JSON.stringify(result.error), {
        status: 400,
      });
    }
    return result.data;
  });
}

export function zParamValidator<T>(zodType: ZodSchema<T>) {
  return validator('param', (v) => {
    const result = zodType.safeParse(v);
    if (!result.success) {
      return new Response(JSON.stringify(result.error), {
        status: 400,
      });
    }
    return result.data;
  });
}
