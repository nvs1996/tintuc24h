const express = require('express');
const router = express.Router();

const { requireAuth, redirectIfAuthed } = require('../middleware/auth');
const upload = require('../middleware/upload');

const authController = require('../controllers/admin/authController');
const categoryController = require('../controllers/admin/categoryController');
const tiktokController = require('../controllers/admin/tiktokController');
const configController = require('../controllers/admin/configController');
const articleController = require('../controllers/admin/articleController');
const eventController = require('../controllers/admin/eventController');

const Article = require('../models/Article');
const Category = require('../models/Category');
const TiktokProduct = require('../models/TiktokProduct');

// Auth
router.get('/login', redirectIfAuthed, authController.showLogin);
router.post('/login', redirectIfAuthed, authController.login);
router.post('/logout', requireAuth, authController.logout);

router.get('/change-password', requireAuth, authController.showChangePassword);
router.post('/change-password', requireAuth, authController.changePassword);

// Dashboard
router.get('/', requireAuth, async (req, res) => {
  const [articleCount, categoryCount, tiktokCount] = await Promise.all([
    Article.countDocuments(),
    Category.countDocuments(),
    TiktokProduct.countDocuments(),
  ]);
  res.render('admin/dashboard', { articleCount, categoryCount, tiktokCount });
});

// Categories
router.get('/categories', requireAuth, categoryController.list);
router.get('/categories/new', requireAuth, categoryController.showNew);
router.post('/categories', requireAuth, categoryController.create);
router.get('/categories/:id/edit', requireAuth, categoryController.showEdit);
router.post('/categories/:id', requireAuth, categoryController.update);
router.post('/categories/:id/delete', requireAuth, categoryController.remove);

// TikTok products
router.get('/tiktok', requireAuth, tiktokController.list);
router.get('/tiktok/new', requireAuth, tiktokController.showNew);
router.post('/tiktok', requireAuth, upload.single('image'), tiktokController.create);
router.get('/tiktok/:id/edit', requireAuth, tiktokController.showEdit);
router.post('/tiktok/:id', requireAuth, upload.single('image'), tiktokController.update);
router.post('/tiktok/:id/delete', requireAuth, tiktokController.remove);

// Events
router.get('/events', requireAuth, eventController.list);
router.get('/events/new', requireAuth, eventController.showNew);
router.post('/events', requireAuth, upload.single('image'), eventController.create);
router.get('/events/:id/edit', requireAuth, eventController.showEdit);
router.post('/events/:id', requireAuth, upload.single('image'), eventController.update);
router.post('/events/:id/delete', requireAuth, eventController.remove);

// Articles
router.get('/articles', requireAuth, articleController.list);
router.get('/articles/new', requireAuth, articleController.showNew);
router.post(
  '/articles',
  requireAuth,
  upload.fields([{ name: 'bodyImage1', maxCount: 1 }, { name: 'bodyImage2', maxCount: 1 }]),
  articleController.create
);
router.get('/articles/:id/edit', requireAuth, articleController.showEdit);
router.post(
  '/articles/:id',
  requireAuth,
  upload.fields([{ name: 'bodyImage1', maxCount: 1 }, { name: 'bodyImage2', maxCount: 1 }]),
  articleController.update
);
router.post('/articles/:id/clone', requireAuth, articleController.clone);
router.post('/articles/:id/delete', requireAuth, articleController.remove);

// Site config
router.get('/config', requireAuth, configController.show);
router.post('/config', requireAuth, upload.single('logo'), configController.update);

module.exports = router;
