import { z } from 'zod';

const analyzeSchema = z.object({
  hobby: z
    .string()
    .min(2, 'El hobby debe tener al menos 2 caracteres')
    .max(150)
    .trim()
    .optional()
    .default(''),
  feel: z
    .enum(['dramatic', 'poetic', 'sharp', 'visionary', 'technical'])
    .optional()
    .default('dramatic'),
});

export { analyzeSchema };
