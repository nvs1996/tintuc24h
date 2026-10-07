const express = require('express');
const router = express.Router();
const siteController = require('../controllers/site/siteController');

router.get('/', siteController.home);
router.get('/danh-muc/:slug', siteController.category);
router.get('/tin-tuc/:slug', siteController.articleDetail);
router.post('/api/tiktok-click/:id', siteController.trackTiktokClick);

module.exports = router;
