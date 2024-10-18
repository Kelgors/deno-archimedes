import { validator } from "hono/validator";
import type { ZodSchema } from "zod";

// fix: https://github.com/honojs/middleware/issues/77
export function zValidator<T>(validatorType: "json", zodType: ZodSchema<T>) {
  return validator(validatorType, (v, c) => {
    const result = zodType.safeParse(v);
    if (!result.success) {
      return new Response(JSON.stringify(result.error), {
        status: 400,
      });
    }
    return result.data;
  });
}
