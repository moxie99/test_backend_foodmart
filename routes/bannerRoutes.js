const router = require('express').Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const bannerController = require('../controllers/bannerController');

router.post('/banner/add', authMiddleware, bannerController.add_banner);

module.exports = router;
