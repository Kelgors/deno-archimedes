import { Hono } from 'hono';
import bookmarks from './bookmarks.ts';

const router = new Hono().basePath('/api');

router.route('/bookmarks', bookmarks);

router.notFound((c) => c.json({}, 404));

export default router;
