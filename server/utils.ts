import { ZodSchema } from "zod";

export function validateRequest<T>(schema: ZodSchema, data: any) {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data as T };
  } else {
    return { success: false, error: result.error };
  }
}