import { Hono } from 'hono';
import { zJsonValidator, zParamValidator } from '../middlewares/zValidator.ts';
import { bookmarkObjectIdSchema, bookmarkSchema, type PersistantBookmark } from '../types/bookmarks.ts';
import type { HonoEnv } from '../types/hono.ts';

const router = new Hono<HonoEnv>();

router.get('/', async (c) => {
  const db = c.get('db');
  const dbItems = await db
    .queryObject<PersistantBookmark>(
      `SELECT b.* FROM bookmarks b INNER JOIN bookmark_users bu ON bu.bookmark_id = b.id WHERE bu.user_id = $USER_ID`,
      { user_id: c.get('token').sub },
    );

  return c.json({ data: dbItems.rows });
});

router.get('/:id', zParamValidator(bookmarkObjectIdSchema), async (c) => {
  const db = c.get('db');
  const result = await db.queryObject<PersistantBookmark>(
    `SELECT b.* FROM bookmarks b INNER JOIN bookmark_users bu ON bu.bookmark_id = b.id WHERE bu.bookmark_id = $BOOKMARK_ID AND bu.user_id = $USER_ID LIMIT 1`,
    { bookmark_id: c.req.param('id'), user_id: c.get('token').sub },
  );
  return c.json({ data: result.rows[0] || null }, result.rows[0] ? 200 : 404);
});

router.post(
  '/',
  zJsonValidator(bookmarkSchema),
  async (c) => {
    const body = c.req.valid('json');
    const db = c.get('db');
    const result = await db.queryObject<PersistantBookmark>(
      `INSERT INTO bookmarks (name, url, description) VALUES ($NAME, $URL, $DESCRIPTION) RETURNING *`,
      body,
    );
    if (result.rowCount !== 1) {
      return c.json({ error: { message: 'Cannot create the bookmark' } }, 500);
    }

    await db.queryArray(`INSERT INTO bookmark_users (bookmark_id, user_id) VALUES ($BOOKMARK_ID, $USER_ID);`, {
      bookmark_id: result.rows[0].id,
      user_id: c.get('token').sub,
    });
    return c.json({ data: result.rows[0] || null }, result.rows[0]?.id ? 201 : 500);
  },
);

router.put(
  '/:id',
  zParamValidator(bookmarkObjectIdSchema),
  zJsonValidator(bookmarkSchema),
  async (c) => {
    const body = c.req.valid('json');
    const db = c.get('db');
    const result = await db.queryObject<PersistantBookmark>(
      `UPDATE bookmarks SET name = $NAME, url = $URL, description = $DESCRIPTION WHERE id = $ID RETURNING *`,
      { id: c.req.param('id'), ...body },
    );
    return c.json({ data: result.rows[0] || null });
  },
);

router.delete('/:id', zParamValidator(bookmarkObjectIdSchema), async (c) => {
  const db = c.get('db');
  const result = await db.queryArray(
    `DELETE FROM bookmarks WHERE id = $ID`,
    { id: c.req.param('id') },
  );
  return c.json({ success: (result.rowCount || 0) > 0 });
});

export default router;
