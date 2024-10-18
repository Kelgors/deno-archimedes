import { z } from 'zod';

export const bookmarkIdSchema = z.string().uuid();
export const bookmarkObjectIdSchema = z.object({ id: bookmarkIdSchema });

export const bookmarkSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  description: z.string(),
});

export const persistantBookmarkSchema = bookmarkSchema.and(bookmarkObjectIdSchema);
export type PersistantBookmark = z.infer<typeof persistantBookmarkSchema>;
