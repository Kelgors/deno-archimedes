import { z } from "zod";

export const bookmarkIdSchema = z.string().uuid();

export const bookmarkSchema = z.object({
  name: z.string(),
  url: z.string(),
  description: z.string(),
});

export const persistantBookmarkSchema = bookmarkSchema.merge(
  z.object({ id: bookmarkIdSchema }),
);
export type PersistantBookmark = z.infer<typeof persistantBookmarkSchema>;

export const BookmarkInput = bookmarkSchema;
