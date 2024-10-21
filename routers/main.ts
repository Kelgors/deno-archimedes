import { Hono } from 'hono';
import { authenticate } from '../middlewares/authenticate.ts';
import auth from './auth.ts';
import bookmarks from './bookmarks.ts';

const router = new Hono().basePath('/api');

router.route('/auth', auth);

router.use(authenticate());
router.route('/bookmarks', bookmarks);

router.notFound((c) => c.json({}, 404));

export default router;
