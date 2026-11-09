import { z } from 'astro/zod';
import { TYPE_IDS } from './entries';

/** Front matter for an entry in src/content/posts. `image` is Astro's image() helper. */
export function postSchema(image: () => z.ZodTypeAny) {
  return z
    .object({
      title: z.string().trim().min(1),
      date: z.coerce.date(),
      type: z.enum(TYPE_IDS),
      summary: z.string().optional(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      draft: z.boolean().default(false),
    })
    .refine((d) => !d.image || !!d.imageAlt?.trim(), {
      message: 'imageAlt is required when image is set',
      path: ['imageAlt'],
    });
}
