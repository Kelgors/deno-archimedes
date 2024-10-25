import { Hono } from 'hono';
import {
  createBookmark,
  createBookmarkUserJoin,
  deleteBookmark,
  findAllBookmarks,
  findBookmarkById,
  updateBookmark,
} from '../db/repositories/bookmarks_sql.ts';
import { zJsonValidator, zParamValidator } from '../middlewares/zValidator.ts';
import { bookmarkObjectIdSchema, bookmarkSchema } from '../types/bookmarks.ts';
import type { HonoEnv } from '../types/hono.ts';

const router = new Hono<HonoEnv>();

router.get('/', async (c) => {
  const dbItems = await findAllBookmarks(c.get('db'), {
    userId: c.get('token').sub,
  });
  return c.json({ data: dbItems });
});

router.get('/:id', zParamValidator(bookmarkObjectIdSchema), async (c) => {
  const dbItem = await findBookmarkById(c.get('db'), {
    bookmarkId: c.req.param('id'),
    userId: c.get('token').sub,
  });
  return c.json({ data: dbItem }, dbItem ? 200 : 404);
});

router.post(
  '/',
  zJsonValidator(bookmarkSchema),
  async (c) => {
    const tx = c.get('db').createTransaction('create_user');

    await tx.begin();

    const dbItem = await createBookmark(tx, c.req.valid('json'));
    if (!dbItem) throw new Error('Unable to create bookmark');

    await createBookmarkUserJoin(tx, {
      bookmarkId: dbItem.id,
      userId: c.get('token').sub,
    });

    await tx.commit();

    return c.json({ data: dbItem }, 201);
  },
);

router.put(
  '/:id',
  zParamValidator(bookmarkObjectIdSchema),
  zJsonValidator(bookmarkSchema),
  async (c) => {
    const result = await updateBookmark(c.get('db'), {
      id: c.req.param('id'),
      ...c.req.valid('json'),
    });
    return c.json({ data: result });
  },
);

router.delete('/:id', zParamValidator(bookmarkObjectIdSchema), async (c) => {
  await deleteBookmark(c.get('db'), { id: c.req.param('id') });
  return c.json({});
});

export default router;
